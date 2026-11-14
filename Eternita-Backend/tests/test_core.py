import copy

import pytest

from app.hashing import (
    GENESIS,
    IntegrityError,
    make_version,
    verify_projections,
    verify_versions,
)


def make_chain():
    first = make_version(
        owner_id="owner1",
        seq=1,
        entry_id="entry1",
        version_no=1,
        content={"original_text": "First version"},
        previous_hash=GENESIS,
        created_at="2026-01-01T00:00:00+00:00",
    )

    second = make_version(
        owner_id="owner1",
        seq=2,
        entry_id="entry1",
        version_no=2,
        content={"original_text": "Second version"},
        previous_hash=first["hash"],
        created_at="2026-01-02T00:00:00+00:00",
    )

    return [first, second]


def test_valid_chain():
    records = make_chain()

    latest = verify_versions(
        records,
        "owner1",
        records[-1]["hash"],
        2,
    )

    assert latest["entry1"]["version_no"] == 2


def test_changed_content_is_detected():
    records = make_chain()
    head = records[-1]["hash"]
    records[0]["content"]["original_text"] = "Tampered"

    with pytest.raises(IntegrityError):
        verify_versions(records, "owner1", head, 2)


def test_missing_last_version_is_detected():
    records = make_chain()
    head = records[-1]["hash"]

    with pytest.raises(IntegrityError):
        verify_versions(records[:-1], "owner1", head, 2)


def test_missing_first_version_is_detected():
    records = make_chain()
    head = records[-1]["hash"]

    with pytest.raises(IntegrityError):
        verify_versions(records[1:], "owner1", head, 2)


def test_wrong_owner_is_detected():
    records = make_chain()

    with pytest.raises(IntegrityError):
        verify_versions(
            records,
            "different-owner",
            records[-1]["hash"],
            2,
        )


def test_projection_tampering_is_detected():
    records = make_chain()

    latest = verify_versions(
        records,
        "owner1",
        records[-1]["hash"],
        2,
    )

    version = latest["entry1"]

    projection = {
        "content": copy.deepcopy(version["content"]),
        "current_version": version["version_no"],
        "last_seq": version["seq"],
        "version_hash": version["hash"],
        "updated_at": version["created_at"],
    }

    verify_projections(latest, {"entry1": projection})

    projection["content"]["original_text"] = "Changed latest document"

    with pytest.raises(IntegrityError):
        verify_projections(latest, {"entry1": projection})


def test_missing_entry_projection_is_detected():
    records = make_chain()

    latest = verify_versions(
        records,
        "owner1",
        records[-1]["hash"],
        2,
    )

    with pytest.raises(IntegrityError):
        verify_projections(latest, {})