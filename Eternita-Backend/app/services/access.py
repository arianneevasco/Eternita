from dataclasses import dataclass
from pathlib import Path

from pyswip import Prolog

from app.errors import AccessDenied, PolicySyntaxError


RULES_PATH = Path(__file__).resolve().parents[2] / "prolog" / "rules.pl"


@dataclass(frozen=True)
class AccessDecision:
    allowed: bool
    viewer: str
    action: str
    topic: str
    reason: str


class AccessEvaluator:
    def __init__(self, facts: list[str]):
        if not RULES_PATH.exists():
            raise FileNotFoundError(
                f"Prolog rules file not found: {RULES_PATH}"
            )

        self.prolog = Prolog()

        self._clear_policy_facts()
        self.prolog.consult(str(RULES_PATH))

        for fact in facts:
            self._assert_fact(fact)

    def _clear_policy_facts(self):
        for predicate in ("allow", "deny", "release"):
            list(
                self.prolog.query(
                    f"retractall({predicate}(_,_,_))"
                )
            )

    def _assert_fact(self, fact: str):
        cleaned = fact.strip()

        if not cleaned.endswith("."):
            raise PolicySyntaxError(
                f"invalid Prolog fact: {cleaned!r}"
            )

        try:
            self.prolog.assertz(cleaned[:-1])
        except Exception as error:
            raise PolicySyntaxError(
                f"invalid policy fact {cleaned!r}: {error}"
            )

    def decide(
        self,
        viewer: str,
        action: str,
        topic: str,
    ) -> AccessDecision:
        if action not in {"existence", "summary"}:
            raise ValueError(f"unsupported action: {action}")

        query = (
            f"permitted('{viewer}',"
            f"{action},"
            f"{topic})"
        )

        allowed = bool(list(self.prolog.query(query)))

        if allowed:
            return AccessDecision(
                allowed=True,
                viewer=viewer,
                action=action,
                topic=topic,
                reason="explicit_allow",
            )

        return AccessDecision(
            allowed=False,
            viewer=viewer,
            action=action,
            topic=topic,
            reason="deny_or_no_permission",
        )

    def require(
        self,
        viewer: str,
        action: str,
        topic: str,
    ) -> AccessDecision:
        decision = self.decide(viewer, action, topic)

        if not decision.allowed:
            raise AccessDenied(
                "You do not have permission to view this information."
            )

        return decision