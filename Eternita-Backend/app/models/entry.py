from datetime import date, time
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)


Name = Annotated[
    str,
    StringConstraints(pattern=r"^[a-z][a-z0-9_]{0,30}$"),
]

Journal = Literal["personal", "health", "family", "travel"]
Emotion = Literal["care", "joy", "pride", "peace", "heavy"]


class EntryContent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=200)
    original_text: str = Field(min_length=1, max_length=20000)
    journal: Journal = "personal"
    entry_date: date
    entry_time: time
    mood: int = Field(ge=1, le=5)
    emotion: Emotion = "peace"
    tags: list[Name] = Field(default_factory=list, max_length=100)
    people: list[Name] = Field(default_factory=list, max_length=100)

    @field_validator("title", "original_text")
    @classmethod
    def reject_blank_text(cls, value):
        if not value.strip():
            raise ValueError("Must not be blank")
        return value

    @field_validator("entry_time")
    @classmethod
    def require_local_time(cls, value):
        if value.tzinfo is not None:
            raise ValueError("Use a local diary time without a timezone")
        return value


class EntryCreate(EntryContent):
    pass


class EntryEdit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    original_text: str | None = Field(
        default=None,
        min_length=1,
        max_length=20000,
    )
    journal: Journal | None = None
    entry_date: date | None = None
    entry_time: time | None = None
    mood: int | None = Field(default=None, ge=1, le=5)
    emotion: Emotion | None = None
    tags: list[Name] | None = Field(default=None, max_length=100)
    people: list[Name] | None = Field(default=None, max_length=100)

    @model_validator(mode="after")
    def require_changes(self):
        fields = self.model_fields_set - {"expected_version"}

        if not fields:
            raise ValueError("Provide at least one field to edit")

        if any(getattr(self, name) is None for name in fields):
            raise ValueError("Edited fields cannot be null")

        return self


class FavoriteIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    is_favorite: bool