from dataclasses import dataclass


@dataclass(frozen=True)
class LegacyAccessDecision:
    allowed: bool
    reason: str


def evaluate_legacy_access(
    owner_uid: str,
    owner_profile: dict,
    viewer_profile: dict,
    policy: dict | None,
) -> LegacyAccessDecision:
    if viewer_profile.get("role") != "second_user":
        return LegacyAccessDecision(
            allowed=False,
            reason="not_registered_person",
        )

    if viewer_profile.get("owner_id") != owner_uid:
        return LegacyAccessDecision(
            allowed=False,
            reason="not_linked_to_owner",
        )

    if not viewer_profile.get("verified"):
        return LegacyAccessDecision(
            allowed=False,
            reason="recipient_not_verified",
        )

    if not owner_profile.get("deceased"):
        return LegacyAccessDecision(
            allowed=False,
            reason="owner_not_marked_deceased",
        )

    if policy is None:
        return LegacyAccessDecision(
            allowed=False,
            reason="policy_not_saved",
        )

    if policy.get("status") != "frozen":
        return LegacyAccessDecision(
            allowed=False,
            reason="policy_not_frozen",
        )

    return LegacyAccessDecision(
        allowed=True,
        reason="legacy_access_ready",
    )