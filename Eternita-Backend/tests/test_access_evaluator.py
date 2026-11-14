import pytest

from app.errors import AccessDenied
from app.services.access import AccessEvaluator


FACTS = [
    "allow(maria,summary,tag(family)).",
    "deny(maria,summary,tag(health)).",
    "allow(maria,existence,mentions(maria)).",
]


def test_allowed_summary():
    evaluator = AccessEvaluator(FACTS)
    decision = evaluator.decide(
        "maria",
        "summary",
        "tag(family)",
    )

    assert decision.allowed is True
    assert decision.reason == "explicit_allow"


def test_denied_summary_overrides_allow():
    evaluator = AccessEvaluator(
        FACTS + [
            "allow(maria,summary,tag(health)).",
        ]
    )

    decision = evaluator.decide(
        "maria",
        "summary",
        "tag(health)",
    )

    assert decision.allowed is False
    assert decision.reason == "deny_or_no_permission"


def test_no_permission_is_denied():
    evaluator = AccessEvaluator(FACTS)

    decision = evaluator.decide(
        "maria",
        "summary",
        "tag(travel)",
    )

    assert decision.allowed is False


def test_existence_permission_is_separate():
    evaluator = AccessEvaluator(FACTS)

    existence = evaluator.decide(
        "maria",
        "existence",
        "mentions(maria)",
    )

    summary = evaluator.decide(
        "maria",
        "summary",
        "mentions(maria)",
    )

    assert existence.allowed is True
    assert summary.allowed is False


def test_require_raises_access_denied():
    evaluator = AccessEvaluator(FACTS)

    with pytest.raises(AccessDenied):
        evaluator.require(
            "maria",
            "summary",
            "tag(health)",
        )


def test_require_returns_decision_when_allowed():
    evaluator = AccessEvaluator(FACTS)
    decision = evaluator.require(
        "maria",
        "summary",
        "tag(family)",
    )

    assert decision.allowed is True


def test_invalid_action_is_rejected():
    evaluator = AccessEvaluator(FACTS)

    with pytest.raises(ValueError):
        evaluator.decide(
            "maria",
            "full_entry",
            "tag(family)",
        )


def test_invalid_fact_is_rejected():
    with pytest.raises(Exception):
        AccessEvaluator([
            "allow(maria,summary,tag(family)"
        ])