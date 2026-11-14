import hashlib
import json
from datetime import datetime, timezone


GENESIS = "0" * 64


class IntegrityError(Exception):
    pass


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def canonical_json(value):
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    )


def compute_hash(record):
    payload = {
        key: record[key]
        for key in (
            "owner_id",
            "seq",
            "entry_id",
            "version_no",
            "created_at",
            "previous_hash",
            "content",
        )
    }

    return hashlib.sha256(
        canonical_json(payload).encode("utf-8")
    ).hexdigest()


def make_version(
    owner_id,
    seq,
    entry_id,
    version_no,
    content,
    previous_hash,
    created_at=None,
):
    record = {
        "owner_id": owner_id,
        "seq": seq,
        "entry_id": entry_id,
        "version_no": version_no,
        "created_at": created_at or now_iso(),
        "previous_hash": previous_hash,
        "content": content,
    }

    record["hash"] = compute_hash(record)

    return record


def verify_versions(records, owner_id, head_hash, head_seq):
    previous = GENESIS
    latest = {}

    for expected_seq, record in enumerate(records, start=1):
        if record["owner_id"] != owner_id:
            raise IntegrityError("Wrong owner in version history")

        if record["seq"] != expected_seq:
            raise IntegrityError(
                f"Missing or invalid sequence at {expected_seq}"
            )

        if record["previous_hash"] != previous:
            raise IntegrityError(
                f"Broken chain link at sequence {expected_seq}"
            )

        entry_id = record["entry_id"]
        prior = latest.get(entry_id)
        expected_version = prior["version_no"] + 1 if prior else 1

        if record["version_no"] != expected_version:
            raise IntegrityError(
                f"Invalid entry version at sequence {expected_seq}"
            )

        if compute_hash(record) != record["hash"]:
            raise IntegrityError(
                f"Content changed at sequence {expected_seq}"
            )

        latest[entry_id] = record
        previous = record["hash"]

    if len(records) != head_seq:
        raise IntegrityError("Stored sequence does not match history")

    if previous != head_hash:
        raise IntegrityError("Stored head does not match history")

    return latest


def verify_projections(latest_versions, entries):
    if set(latest_versions) != set(entries):
        raise IntegrityError(
            "Entry documents do not match the version history"
        )

    for entry_id, version in latest_versions.items():
        entry = entries[entry_id]

        comparisons = {
            "content": version["content"],
            "current_version": version["version_no"],
            "last_seq": version["seq"],
            "version_hash": version["hash"],
            "updated_at": version["created_at"],
        }

        for field, expected in comparisons.items():
            if entry.get(field) != expected:
                raise IntegrityError(
                    f"Latest entry differs from history: {entry_id}"
                )