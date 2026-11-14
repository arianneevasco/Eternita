import re

from app.errors import PolicySyntaxError


NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,30}$")


def checked_identifier(value: str) -> str:
    if not isinstance(value, str):
        raise PolicySyntaxError("Identifier must be text")

    if not NAME_PATTERN.fullmatch(value):
        raise PolicySyntaxError(
            f"invalid identifier {value!r}"
        )

    return value


def entry_topics(entry: dict) -> list[str]:
    content = entry.get("content", {})

    if not isinstance(content, dict):
        raise ValueError("Entry content must be an object")

    tags = content.get("tags", [])
    people = content.get("mentioned_people", [])

    if not isinstance(tags, list):
        raise ValueError("Entry tags must be a list")

    if not isinstance(people, list):
        raise ValueError("Entry mentioned_people must be a list")

    topics = []

    for tag in tags:
        checked_identifier(tag)
        topic = f"tag({tag})"

        if topic not in topics:
            topics.append(topic)

    for person in people:
        checked_identifier(person)
        topic = f"mentions({person})"

        if topic not in topics:
            topics.append(topic)

    return topics