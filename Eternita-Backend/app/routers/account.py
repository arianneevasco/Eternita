import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from firebase_admin import auth, firestore

from app.dependencies import current_owner, current_user
from app.firebase import db
from app.models.user import (
    DeviceIn,
    InviteIn,
    JoinIn,
    OwnerIn,
    SettingsIn,
)


router = APIRouter(tags=["account"])

DEFAULT_SETTINGS = {
    "reminder_time": "20:00",
    "autolock_minutes": 5,
    "dark_mode": False,
}

GENESIS = "0" * 64


def utc_now():
    return datetime.now(timezone.utc)


def user_ref(uid):
    return db.collection("users").document(uid)


def code_hash(code):
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def profile_required(uid):
    snapshot = user_ref(uid).get()

    if not snapshot.exists:
        raise HTTPException(
            status_code=403,
            detail="Register an Alaala profile first",
        )

    return snapshot.to_dict()


def active_owner(profile):
    if profile.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owners only")

    if profile.get("deceased"):
        raise HTTPException(
            status_code=403,
            detail="Owner writes are disabled",
        )


def add_activity(txn, uid, action, at, detail=""):
    ref = user_ref(uid).collection("activity").document()

    txn.set(ref, {
        "action": action,
        "detail": detail,
        "at": at,
    })


@firestore.transactional
def register_owner_txn(txn, uid, body):
    ref = user_ref(uid)
    snapshot = ref.get(transaction=txn)

    if snapshot.exists:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists",
        )

    now = utc_now()

    txn.set(ref, {
        "role": "owner",
        "name": body.name,
        "handle": body.handle,
        "deceased": False,
        "settings": dict(DEFAULT_SETTINGS),
        "last_seq": 0,
        "last_hash": GENESIS,
        "created_at": now,
    })

    add_activity(txn, uid, "register_owner", now)

    return {
        "uid": uid,
        "role": "owner",
        "name": body.name,
        "handle": body.handle,
    }


@router.post("/auth/register-owner", status_code=201)
def register_owner(
    body: OwnerIn,
    uid: str = Depends(current_user),
):
    return register_owner_txn(db.transaction(), uid, body)


@router.get("/me")
def me(uid: str = Depends(current_user)):
    profile = profile_required(uid)

    # Do not expose internal chain state or future administrative fields.
    fields = (
        "role",
        "name",
        "handle",
        "owner_id",
        "verified",
        "deceased",
        "settings",
        "created_at",
    )

    return {
        "uid": uid,
        **{key: profile[key] for key in fields if key in profile},
    }


@firestore.transactional
def create_invite_txn(txn, uid, body, invitation_id):
    owner_ref = user_ref(uid)
    owner_snapshot = owner_ref.get(transaction=txn)

    handle_ref = (
        owner_ref.collection("recipient_handles").document(body.handle)
    )
    handle_snapshot = handle_ref.get(transaction=txn)

    if not owner_snapshot.exists:
        raise HTTPException(status_code=403, detail="Owners only")

    active_owner(owner_snapshot.to_dict())

    now = utc_now()

    if handle_snapshot.exists:
        reserved = handle_snapshot.to_dict()

        if reserved.get("status") == "joined":
            raise HTTPException(
                status_code=409,
                detail="Recipient handle already registered",
            )

        expires_at = reserved.get("expires_at")

        if expires_at is None or expires_at > now:
            raise HTTPException(
                status_code=409,
                detail="An active invitation already uses this handle",
            )

    expires_at = now + timedelta(hours=48)

    invitation_ref = db.collection("invites").document(invitation_id)

    txn.set(invitation_ref, {
        "owner_id": uid,
        "name": body.name,
        "handle": body.handle,
        "email": body.email.strip().casefold(),
        "used": False,
        "created_at": now,
        "expires_at": expires_at,
    })

    txn.set(handle_ref, {
        "status": "pending",
        "invite_id": invitation_id,
        "expires_at": expires_at,
    })

    add_activity(txn, uid, "invite_created", now, body.handle)

    return expires_at


@router.post("/invites", status_code=201)
def create_invite(
    body: InviteIn,
    response: Response,
    uid: str = Depends(current_owner),
):
    email = body.email.strip()

    if (
        email.count("@") != 1
        or any(character.isspace() for character in email)
    ):
        raise HTTPException(status_code=422, detail="Invalid email")

    code = secrets.token_urlsafe(32)

    expires_at = create_invite_txn(
        db.transaction(),
        uid,
        body,
        code_hash(code),
    )

    response.headers["Cache-Control"] = "no-store"

    return {
        "code": code,
        "expires_at": expires_at,
        "handle": body.handle,
    }


def invalid_invitation():
    raise HTTPException(
        status_code=400,
        detail="Invitation is invalid or unavailable",
    )


@firestore.transactional
def join_txn(txn, uid, invitation_id, email):
    new_profile_ref = user_ref(uid)
    invitation_ref = db.collection("invites").document(invitation_id)

    profile_snapshot = new_profile_ref.get(transaction=txn)
    invitation_snapshot = invitation_ref.get(transaction=txn)

    if profile_snapshot.exists:
        raise HTTPException(
            status_code=409,
            detail="Profile already exists",
        )

    if not invitation_snapshot.exists:
        invalid_invitation()

    invitation = invitation_snapshot.to_dict()

    owner_ref = user_ref(invitation["owner_id"])
    handle_ref = (
        owner_ref.collection("recipient_handles")
        .document(invitation["handle"])
    )

    owner_snapshot = owner_ref.get(transaction=txn)
    handle_snapshot = handle_ref.get(transaction=txn)

    now = utc_now()

    if (
        invitation.get("used")
        or invitation.get("expires_at") is None
        or invitation["expires_at"] <= now
        or invitation.get("email") != email
    ):
        invalid_invitation()

    if not owner_snapshot.exists:
        invalid_invitation()

    owner = owner_snapshot.to_dict()

    if owner.get("role") != "owner" or owner.get("deceased"):
        invalid_invitation()

    if not handle_snapshot.exists:
        invalid_invitation()

    reservation = handle_snapshot.to_dict()

    if (
        reservation.get("status") != "pending"
        or reservation.get("invite_id") != invitation_id
    ):
        invalid_invitation()

    txn.set(new_profile_ref, {
        "role": "second_user",
        "owner_id": invitation["owner_id"],
        "name": invitation["name"],
        "handle": invitation["handle"],
        "verified": False,
        "settings": dict(DEFAULT_SETTINGS),
        "created_at": now,
    })

    txn.update(invitation_ref, {
        "used": True,
        "used_by": uid,
        "used_at": now,
    })

    txn.set(handle_ref, {
        "status": "joined",
        "uid": uid,
        "joined_at": now,
    })

    add_activity(
        txn,
        invitation["owner_id"],
        "recipient_joined",
        now,
        invitation["handle"],
    )

    return {
        "uid": uid,
        "role": "second_user",
        "verified": False,
    }


@router.post("/auth/join", status_code=201)
def join(
    body: JoinIn,
    uid: str = Depends(current_user),
):
    account = auth.get_user(uid)

    if not account.email or not account.email_verified:
        raise HTTPException(
            status_code=403,
            detail="Verify your Firebase account email before joining",
        )

    return join_txn(
        db.transaction(),
        uid,
        code_hash(body.code.strip()),
        account.email.strip().casefold(),
    )


@router.get("/settings")
def get_settings(uid: str = Depends(current_user)):
    profile = profile_required(uid)

    return {
        **DEFAULT_SETTINGS,
        **(profile.get("settings") or {}),
    }


@firestore.transactional
def update_settings_txn(txn, uid, changes):
    ref = user_ref(uid)
    snapshot = ref.get(transaction=txn)

    if not snapshot.exists:
        raise HTTPException(
            status_code=403,
            detail="Register an Alaala profile first",
        )

    profile = snapshot.to_dict()

    settings = {
        **DEFAULT_SETTINGS,
        **(profile.get("settings") or {}),
        **changes,
    }

    txn.update(ref, {"settings": settings})

    return settings


@router.put("/settings")
def put_settings(
    body: SettingsIn,
    uid: str = Depends(current_user),
):
    changes = body.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    return update_settings_txn(db.transaction(), uid, changes)


@router.post("/devices", status_code=201)
def register_device(
    body: DeviceIn,
    uid: str = Depends(current_user),
):
    profile_required(uid)

    device_id = code_hash(body.token)

    (
        user_ref(uid)
        .collection("devices")
        .document(device_id)
        .set({
            "token": body.token,
            "updated_at": utc_now(),
        })
    )

    return {"device_id": device_id, "registered": True}


@router.delete("/devices/{device_id}")
def remove_device(
    device_id: str,
    uid: str = Depends(current_user),
):
    profile_required(uid)

    if (
        len(device_id) != 64
        or any(c not in "0123456789abcdef" for c in device_id)
    ):
        raise HTTPException(status_code=422, detail="Invalid device ID")

    user_ref(uid).collection("devices").document(device_id).delete()

    return {"removed": True}


@router.get("/activity")
def activity(uid: str = Depends(current_owner)):
    docs = (
        user_ref(uid)
        .collection("activity")
        .order_by("at", direction=firestore.Query.DESCENDING)
        .limit(50)
        .stream()
    )

    return [{"id": doc.id, **doc.to_dict()} for doc in docs]