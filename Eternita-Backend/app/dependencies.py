from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.firebase import db

bearer = HTTPBearer(auto_error=False)


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing token")

    try:
        decoded = auth.verify_id_token(
            credentials.credentials,
            check_revoked=True,
        )
    except (
        auth.InvalidIdTokenError,
        auth.RevokedIdTokenError,
        auth.UserDisabledError,
        ValueError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    return decoded["uid"]


def current_owner(uid: str = Depends(current_user)) -> str:
    profile = (
        db.collection("users").document(uid).get().to_dict() or {}
    )

    if profile.get("role") != "owner":
        raise HTTPException(status_code=403, detail="Owners only")

    if profile.get("deceased"):
        raise HTTPException(
            status_code=403,
            detail="Owner writes are disabled",
        )

    return uid