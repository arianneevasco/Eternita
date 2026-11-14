from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


Handle = Annotated[
    str,
    StringConstraints(pattern=r"^[a-z][a-z0-9_]{0,30}$"),
]


class RequestModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class OwnerIn(RequestModel):
    name: str = Field(min_length=1, max_length=100)
    handle: Handle


class InviteIn(RequestModel):
    name: str = Field(min_length=1, max_length=100)
    handle: Handle
    email: str = Field(min_length=3, max_length=254)


class JoinIn(RequestModel):
    code: str = Field(min_length=20, max_length=200)


class SettingsIn(RequestModel):
    reminder_time: str | None = Field(
        default=None,
        pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$",
    )
    autolock_minutes: int | None = Field(default=None, ge=1, le=60)
    dark_mode: bool | None = None


class DeviceIn(RequestModel):
    token: str = Field(min_length=20, max_length=4096)