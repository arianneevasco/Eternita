from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import current_user
from app.firebase import db
from app.services.legacy_access import evaluate_legacy_access
from app.services.policy import policy_ref


router = APIRouter(tags=["legacy"])


@router.get("/legacy/status")
def legacy_status(uid: str = Depends(current_user)):
    viewer_snapshot = (
        db.collection("users")
        .document(uid)
        .get()
    )

    if not viewer_snapshot.exists:
        raise HTTPException(
            status_code=403,
            detail="Register an Alaala profile first",
        )

    viewer = viewer_snapshot.to_dict()

    owner_uid = viewer.get("owner_id")

    if not owner_uid:
        raise HTTPException(
            status_code=403,
            detail="This account is not linked to an owner",
        )

    owner_snapshot = (
        db.collection("users")
        .document(owner_uid)
        .get()
    )

    if not owner_snapshot.exists:
        raise HTTPException(
            status_code=403,
            detail="Owner account is unavailable",
        )

    owner = owner_snapshot.to_dict()

    policy_snapshot = policy_ref(owner_uid).get()

    policy = (
        policy_snapshot.to_dict()
        if policy_snapshot.exists
        else None
    )

    decision = evaluate_legacy_access(
        owner_uid=owner_uid,
        owner_profile=owner,
        viewer_profile=viewer,
        policy=policy,
    )

    return {
        "legacy_access": decision.allowed,
        "reason": decision.reason,
    }