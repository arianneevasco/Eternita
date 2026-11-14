from datetime import datetime, timezone

from fastapi import HTTPException
from firebase_admin import firestore

from app.errors import PolicySyntaxError
from app.firebase import db
from app.policy.interpreter import compile_policy


def utc_now():
    return datetime.now(timezone.utc)


def policy_ref(uid: str):
    return (
        db.collection("users")
        .document(uid)
        .collection("policy")
        .document("current")
    )


def user_ref(uid: str):
    return db.collection("users").document(uid)


def add_activity(txn, uid, action, at, detail=""):
    ref = user_ref(uid).collection("activity").document()

    txn.set(ref, {
        "action": action,
        "detail": detail,
        "at": at,
    })


def compile_source(source: str) -> dict:
    try:
        return compile_policy(source)
    except PolicySyntaxError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        )


def policy_document(
    source: str,
    compiled: dict,
    status: str,
    now: datetime,
    frozen_at: datetime | None = None,
) -> dict:
    return {
        "source": source,
        "schema_version": compiled["schema_version"],
        "facts": compiled["facts"],
        "releases": compiled["releases"],
        "custody_declarations": compiled["custody_declarations"],
        "default_mode": compiled["default_mode"],
        "status": status,
        "updated_at": now,
        "frozen_at": frozen_at,
    }


@firestore.transactional
def save_policy_txn(txn, uid: str, document: dict, now: datetime):
    snapshot = policy_ref(uid).get(transaction=txn)

    if snapshot.exists:
        existing = snapshot.to_dict()

        if existing.get("status") == "frozen":
            raise HTTPException(
                status_code=409,
                detail="Policy is frozen and cannot be replaced",
            )

    txn.set(policy_ref(uid), document)
    add_activity(txn, uid, "policy_saved", now)

    return document


def save_policy(uid: str, source: str) -> dict:
    compiled = compile_source(source)
    now = utc_now()

    document = policy_document(
        source=source,
        compiled=compiled,
        status="draft",
        now=now,
    )

    return save_policy_txn(
        db.transaction(),
        uid,
        document,
        now,
    )


def get_policy(uid: str) -> dict:
    snapshot = policy_ref(uid).get()

    if not snapshot.exists:
        raise HTTPException(
            status_code=404,
            detail="No policy has been saved",
        )

    return snapshot.to_dict()


@firestore.transactional
def freeze_policy_txn(txn, uid: str, now: datetime):
    snapshot = policy_ref(uid).get(transaction=txn)

    if not snapshot.exists:
        raise HTTPException(
            status_code=404,
            detail="No policy has been saved",
        )

    policy = snapshot.to_dict()

    if policy.get("status") == "frozen":
        raise HTTPException(
            status_code=409,
            detail="Policy is already frozen",
        )

    txn.update(policy_ref(uid), {
        "status": "frozen",
        "frozen_at": now,
    })

    add_activity(txn, uid, "policy_frozen", now)

    return {
        **policy,
        "status": "frozen",
        "frozen_at": now,
    }


def freeze_policy(uid: str) -> dict:
    return freeze_policy_txn(
        db.transaction(),
        uid,
        utc_now(),
    )