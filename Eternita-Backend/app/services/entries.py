import re
import uuid

from fastapi import HTTPException
from firebase_admin import firestore

from app.firebase import db
from app.hashing import (
    GENESIS,
    IntegrityError,
    canonical_json,
    make_version,
    now_iso,
    verify_projections,
    verify_versions,
)
from app.models.entry import EntryContent


ENTRY_ID = re.compile(r"^[a-f0-9]{32}$")


def owner_ref(uid):
    return db.collection("users").document(uid)


def entry_ref(uid, entry_id):
    if not ENTRY_ID.fullmatch(entry_id):
        raise HTTPException(status_code=404, detail="Entry not found")

    return owner_ref(uid).collection("entries").document(entry_id)


def require_active_owner(profile):
    if not profile or profile.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owners only")

    if profile.get("deceased"):
        raise HTTPException(
            status_code=403,
            detail="Owner writes are disabled",
        )


def build_content(raw):
    validated = EntryContent.model_validate(raw)
    content = validated.model_dump(mode="json")

    content["tags"] = sorted(set(content["tags"]))
    content["people"] = sorted(set(content["people"]))
    content["mode"] = "verbatim"
    content["final_text"] = content["original_text"]

    return content


def add_activity(txn, user, action, entry_id):
    txn.set(user.collection("activity").document(), {
        "action": action,
        "detail": entry_id,
        "at": now_iso(),
    })


def present(snapshot):
    return {"id": snapshot.id, **snapshot.to_dict()}


@firestore.transactional
def append_version_txn(
    txn,
    uid,
    entry_id,
    raw,
    expected_version=None,
):
    user = owner_ref(uid)
    ref = entry_ref(uid, entry_id)

    profile_snapshot = user.get(transaction=txn)
    current_snapshot = ref.get(transaction=txn)

    profile = profile_snapshot.to_dict() or {}
    require_active_owner(profile)

    if expected_version is None:
        if current_snapshot.exists:
            raise HTTPException(
                status_code=409,
                detail="Entry ID already exists",
            )

        current = None
        version_no = 1
        content = build_content(raw)

    else:
        if not current_snapshot.exists:
            raise HTTPException(status_code=404, detail="Entry not found")

        current = current_snapshot.to_dict()

        if current.get("is_hidden"):
            raise HTTPException(status_code=404, detail="Entry not found")

        if current["current_version"] != expected_version:
            raise HTTPException(
                status_code=409,
                detail="Entry changed. Reload it before editing.",
            )

        source_fields = EntryContent.model_fields
        merged = {
            field: current["content"][field]
            for field in source_fields
        }
        merged.update(raw)

        content = build_content(merged)
        version_no = current["current_version"] + 1

    seq = profile.get("last_seq", 0) + 1
    previous_hash = profile.get("last_hash", GENESIS)

    version = make_version(
        owner_id=uid,
        seq=seq,
        entry_id=entry_id,
        version_no=version_no,
        content=content,
        previous_hash=previous_hash,
    )

    latest = {
        "content": content,
        "current_version": version_no,
        "last_seq": seq,
        "version_hash": version["hash"],
        "updated_at": version["created_at"],
    }

    if current is None:
        latest.update({
            "created_at": version["created_at"],
            "is_favorite": False,
            "is_hidden": False,
        })

    version_ref = user.collection("versions").document(f"{seq:012d}")

    txn.create(version_ref, version)

    if current is None:
        txn.create(ref, latest)
    else:
        txn.update(ref, latest)

    txn.update(user, {
        "last_seq": seq,
        "last_hash": version["hash"],
    })

    add_activity(
        txn,
        user,
        "create_entry" if current is None else "edit_entry",
        entry_id,
    )

    response = {
        **(current or {}),
        **latest,
    }

    return {"id": entry_id, **response}


def create_entry(uid, data):
    return append_version_txn(
        db.transaction(),
        uid,
        uuid.uuid4().hex,
        data,
    )


def edit_entry(uid, entry_id, expected_version, changes):
    return append_version_txn(
        db.transaction(),
        uid,
        entry_id,
        changes,
        expected_version,
    )


def list_entries(uid):
    snapshots = owner_ref(uid).collection("entries").stream()

    items = []

    for snapshot in snapshots:
        item = present(snapshot)

        if not item.get("is_hidden"):
            items.append(item)

    return sorted(
        items,
        key=lambda item: (
            item["content"]["entry_date"],
            item["content"]["entry_time"],
            item["id"],
        ),
        reverse=True,
    )


def get_entry(uid, entry_id):
    snapshot = entry_ref(uid, entry_id).get()

    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Entry not found")

    item = present(snapshot)

    if item.get("is_hidden"):
        raise HTTPException(status_code=404, detail="Entry not found")

    return item


@firestore.transactional
def set_flag_txn(txn, uid, entry_id, field, value):
    user = owner_ref(uid)
    ref = entry_ref(uid, entry_id)

    profile_snapshot = user.get(transaction=txn)
    snapshot = ref.get(transaction=txn)

    require_active_owner(profile_snapshot.to_dict() or {})

    if not snapshot.exists:
        raise HTTPException(status_code=404, detail="Entry not found")

    item = snapshot.to_dict()

    if item.get("is_hidden"):
        raise HTTPException(status_code=404, detail="Entry not found")

    txn.update(ref, {field: value})

    add_activity(
        txn,
        user,
        "hide_entry" if field == "is_hidden" else "favorite_entry",
        entry_id,
    )

    return {"id": entry_id, field: value}


def set_favorite(uid, entry_id, value):
    return set_flag_txn(
        db.transaction(),
        uid,
        entry_id,
        "is_favorite",
        value,
    )


def hide_entry(uid, entry_id):
    return set_flag_txn(
        db.transaction(),
        uid,
        entry_id,
        "is_hidden",
        True,
    )


def list_versions(uid, entry_id):
    ref = entry_ref(uid, entry_id)

    # The owner may inspect history even after an entry is hidden.
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Entry not found")

    docs = owner_ref(uid).collection("versions").order_by("seq").stream()

    return [
        snapshot.to_dict()
        for snapshot in docs
        if snapshot.to_dict()["entry_id"] == entry_id
    ]


@firestore.transactional
def integrity_snapshot_txn(txn, uid):
    user = owner_ref(uid)

    profile = user.get(transaction=txn).to_dict() or {}

    versions = [
        snapshot.to_dict()
        for snapshot in user.collection("versions")
        .order_by("seq")
        .stream(transaction=txn)
    ]

    entries = {
        snapshot.id: snapshot.to_dict()
        for snapshot in user.collection("entries").stream(transaction=txn)
    }

    return profile, versions, entries


def check_integrity(uid):
    profile, versions, entries = integrity_snapshot_txn(
        db.transaction(read_only=True),
        uid,
    )

    try:
        latest = verify_versions(
            records=versions,
            owner_id=uid,
            head_hash=profile.get("last_hash", GENESIS),
            head_seq=profile.get("last_seq", 0),
        )

        for version in versions:
            raw = {
                field: version["content"][field]
                for field in EntryContent.model_fields
            }
            validated = build_content(raw)

            if canonical_json(validated) != canonical_json(version["content"]):
                raise IntegrityError("Invalid stored entry content")

        verify_projections(latest, entries)

    except (IntegrityError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=409,
            detail="Integrity check failed",
        )

    return {
        "ok": True,
        "versions_checked": len(versions),
        "entries_checked": len(entries),
        "last_seq": profile.get("last_seq", 0),
    }