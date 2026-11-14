from app.services.legacy_access import evaluate_legacy_access


OWNER = {
    "role": "owner",
    "deceased": False,
}

VERIFIED_VIEWER = {
    "role": "second_user",
    "owner_id": "owner_uid",
    "verified": True,
}

FROZEN_POLICY = {
    "status": "frozen",
}


def test_legacy_access_is_ready():
    owner = {**OWNER, "deceased": True}

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=VERIFIED_VIEWER,
        policy=FROZEN_POLICY,
    )

    assert decision.allowed is True
    assert decision.reason == "legacy_access_ready"


def test_owner_must_be_marked_deceased():
    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=OWNER,
        viewer_profile=VERIFIED_VIEWER,
        policy=FROZEN_POLICY,
    )

    assert decision.allowed is False
    assert decision.reason == "owner_not_marked_deceased"


def test_policy_must_be_frozen():
    owner = {**OWNER, "deceased": True}

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=VERIFIED_VIEWER,
        policy={"status": "draft"},
    )

    assert decision.allowed is False
    assert decision.reason == "policy_not_frozen"


def test_policy_must_exist():
    owner = {**OWNER, "deceased": True}

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=VERIFIED_VIEWER,
        policy=None,
    )

    assert decision.allowed is False
    assert decision.reason == "policy_not_saved"


def test_recipient_must_be_verified():
    owner = {**OWNER, "deceased": True}
    viewer = {**VERIFIED_VIEWER, "verified": False}

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=viewer,
        policy=FROZEN_POLICY,
    )

    assert decision.allowed is False
    assert decision.reason == "recipient_not_verified"


def test_recipient_must_belong_to_owner():
    owner = {**OWNER, "deceased": True}
    viewer = {**VERIFIED_VIEWER, "owner_id": "another_owner"}

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=viewer,
        policy=FROZEN_POLICY,
    )

    assert decision.allowed is False
    assert decision.reason == "not_linked_to_owner"


def test_owner_cannot_use_legacy_access():
    owner = {**OWNER, "deceased": True}
    viewer = {
        "role": "owner",
        "owner_id": "owner_uid",
        "verified": True,
    }

    decision = evaluate_legacy_access(
        owner_uid="owner_uid",
        owner_profile=owner,
        viewer_profile=viewer,
        policy=FROZEN_POLICY,
    )

    assert decision.allowed is False
    assert decision.reason == "not_registered_person"