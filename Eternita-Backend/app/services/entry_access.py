from app.errors import AccessDenied
from app.services.access import AccessEvaluator
from app.services.topics import entry_topics


def check_entry_access(
    evaluator: AccessEvaluator,
    viewer: str,
    entry: dict,
    action: str,
) -> list[str]:
    topics = entry_topics(entry)

    if not topics:
        raise AccessDenied(
            "You do not have permission to view this information."
        )

    for topic in topics:
        evaluator.require(viewer, action, topic)

    return topics