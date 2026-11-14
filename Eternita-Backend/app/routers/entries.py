from fastapi import APIRouter, Depends
from pydantic import ValidationError
from fastapi.exceptions import RequestValidationError

from app.dependencies import current_owner
from app.models.entry import EntryCreate, EntryEdit, FavoriteIn
from app.services import entries


router = APIRouter(prefix="/entries", tags=["entries"])


@router.post("", status_code=201)
def create(
    body: EntryCreate,
    uid: str = Depends(current_owner),
):
    return entries.create_entry(uid, body.model_dump(mode="json"))


@router.get("")
def list_mine(uid: str = Depends(current_owner)):
    return entries.list_entries(uid)


@router.get("/integrity")
def integrity(uid: str = Depends(current_owner)):
    return entries.check_integrity(uid)


@router.get("/{entry_id}/versions")
def versions(
    entry_id: str,
    uid: str = Depends(current_owner),
):
    return entries.list_versions(uid, entry_id)


@router.get("/{entry_id}")
def read_one(
    entry_id: str,
    uid: str = Depends(current_owner),
):
    return entries.get_entry(uid, entry_id)


@router.patch("/{entry_id}")
def edit(
    entry_id: str,
    body: EntryEdit,
    uid: str = Depends(current_owner),
):
    changes = body.model_dump(
        mode="json",
        exclude_unset=True,
        exclude={"expected_version"},
    )

    try:
        return entries.edit_entry(
            uid,
            entry_id,
            body.expected_version,
            changes,
        )
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc


@router.patch("/{entry_id}/favorite")
def favorite(
    entry_id: str,
    body: FavoriteIn,
    uid: str = Depends(current_owner),
):
    return entries.set_favorite(uid, entry_id, body.is_favorite)


@router.delete("/{entry_id}")
def hide(
    entry_id: str,
    uid: str = Depends(current_owner),
):
    return entries.hide_entry(uid, entry_id)