from fastapi import APIRouter, Depends

from app.dependencies import current_owner
from app.models.policy import PolicyIn, PolicyOut
from app.services.policy import (
    freeze_policy,
    get_policy,
    save_policy,
)


router = APIRouter(tags=["policy"])


@router.put("/policy", response_model=PolicyOut)
def put_policy(
    body: PolicyIn,
    uid: str = Depends(current_owner),
):
    return save_policy(uid, body.source)


@router.get("/policy", response_model=PolicyOut)
def get_saved_policy(
    uid: str = Depends(current_owner),
):
    return get_policy(uid)


@router.post("/policy/freeze", response_model=PolicyOut)
def freeze_saved_policy(
    uid: str = Depends(current_owner),
):
    return freeze_policy(uid)