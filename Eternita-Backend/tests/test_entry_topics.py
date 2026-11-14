import pytest

from app.errors import AccessDenied, PolicySyntaxError
from app.services.access import AccessEvaluator
from app.services.entry_access import check_entry_access
from app.services.topics import entry_topics


def test_entry_topics_from_tags_and_people():
    entry = {
        "content": {
            "original_text": "Maria and I visited the beach.",
            "tags": ["family", "travel"],
            "mentioned_people": ["maria"],
        }
    }

    assert entry_topics(entry) == [
        "tag(family)",
        "tag(travel)",
        "mentions(maria)",
    ]


def test_duplicate_topics_appear_once():
    entry = {
        "content": {
            "original_text": "Family trip.",
            "tags": ["family", "family"],
            "mentioned_people": ["maria", "maria"],
        }
    }

    assert entry_topics(entry) == [
        "tag(family)",
        "mentions(maria)",
    ]


def test_entry_without_topics_has_no_topics():
    entry = {
        "content": {
            "original_text": "A private thought.",
        }
    }

    assert entry_topics(entry) == []


def test_invalid_tag_is_rejected():
    entry = {
        "content": {
            "original_text": "Bad tag.",
            "tags": ["Family Trip"],
        }
    }

    with pytest.raises(PolicySyntaxError):
        entry_topics(entry)


def test_invalid_person_is_rejected():
    entry = {
        "content": {
            "original_text": "Bad person.",
            "mentioned_people": ["Maria"],
        }
    }

    with pytest.raises(PolicySyntaxError):
        entry_topics(entry)


def test_allowed_entry_passes_every_topic():
    evaluator = AccessEvaluator([
        "allow(maria,summary,tag(family)).",
        "allow(maria,summary,mentions(maria)).",
    ])

    entry = {
        "content": {
            "original_text": "Maria and I visited the beach.",
            "tags": ["family"],
            "mentioned_people": ["maria"],
        }
    }

    topics = check_entry_access(
        evaluator,
        "maria",
        entry,
        "summary",
    )

    assert topics == [
        "tag(family)",
        "mentions(maria)",
    ]


def test_one_denied_topic_blocks_entry():
    evaluator = AccessEvaluator([
        "allow(maria,summary,tag(family)).",
        "deny(maria,summary,tag(health)).",
    ])

    entry = {
        "content": {
            "original_text": "Family health update.",
            "tags": ["family", "health"],
        }
    }

    with pytest.raises(AccessDenied):
        check_entry_access(
            evaluator,
            "maria",
            entry,
            "summary",
        )


def test_missing_permission_blocks_entry():
    evaluator = AccessEvaluator([
        "allow(maria,summary,tag(family)).",
    ])

    entry = {
        "content": {
            "original_text": "Family travel story.",
            "tags": ["family", "travel"],
        }
    }

    with pytest.raises(AccessDenied):
        check_entry_access(
            evaluator,
            "maria",
            entry,
            "summary",
        )


def test_entry_without_topics_is_denied():
    evaluator = AccessEvaluator([
        "allow(maria,summary,tag(family)).",
    ])

    entry = {
        "content": {
            "original_text": "A private thought.",
        }
    }

    with pytest.raises(AccessDenied):
        check_entry_access(
            evaluator,
            "maria",
            entry,
            "summary",
        )


def test_existence_and_summary_are_checked_separately():
    evaluator = AccessEvaluator([
        "allow(maria,existence,tag(family)).",
    ])

    entry = {
        "content": {
            "original_text": "Family story.",
            "tags": ["family"],
        }
    }

    existence = check_entry_access(
        evaluator,
        "maria",
        entry,
        "existence",
    )

    assert existence == ["tag(family)"]

    with pytest.raises(AccessDenied):
        check_entry_access(
            evaluator,
            "maria",
            entry,
            "summary",
        )