from datetime import datetime

from pydantic import BaseModel, Field


class PolicyIn(BaseModel):
    source: str = Field(
        min_length=1,
        max_length=20000,
        description="The owner's policy text",
    )


class PolicyOut(BaseModel):
    source: str
    schema_version: int
    facts: list[str]
    releases: list[dict]
    custody_declarations: list[dict]
    default_mode: str
    status: str
    updated_at: datetime | None = None
    frozen_at: datetime | None = None