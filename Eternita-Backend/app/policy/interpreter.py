import hashlib
import re
import unicodedata

from app.errors import PolicySyntaxError
from app.policy.parser import Custody, Mode, Release, See, parse


NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,30}$")
SUPPORTED_MODES = {"verbatim", "light_fix", "review"}


def checked_name(value: str, line: int) -> str:
    if not NAME_PATTERN.fullmatch(value):
        raise PolicySyntaxError(
            f"line {line}: invalid identifier {value!r}"
        )

    return value


def letter_id_for_title(title: str) -> str:
    normalized = unicodedata.normalize("NFC", title).strip()

    if not normalized:
        raise PolicySyntaxError("Letter title must not be empty")

    if len(normalized) > 200:
        raise PolicySyntaxError("Letter title exceeds 200 characters")

    digest = hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()

    return "letter_" + digest


def compile_policy(source: str) -> dict:
    protocols = parse(source)

    facts = []
    seen_facts = set()
    releases = []
    release_keys = set()
    custody_transfers = []
    default_mode = None

    def add_fact(fact: str):
        if fact not in seen_facts:
            seen_facts.add(fact)
            facts.append(fact)

    for protocol in protocols:
        viewer = checked_name(protocol.name, protocol.line)

        for statement in protocol.stmts:
            if isinstance(statement, See):
                if statement.kind not in {"existence", "summary"}:
                    raise PolicySyntaxError(
                        f"line {statement.line}: unsupported action"
                    )

                if statement.by not in {"mentions", "tag"}:
                    raise PolicySyntaxError(
                        f"line {statement.line}: unsupported topic type"
                    )

                value = checked_name(
                    statement.value,
                    statement.line,
                )

                predicate = "allow" if statement.allow else "deny"
                topic = f"{statement.by}({value})"

                add_fact(
                    f"{predicate}("
                    f"{viewer},{statement.kind},{topic}"
                    f")."
                )

            elif isinstance(statement, Release):
                recipient = checked_name(
                    statement.to,
                    statement.line,
                )

                if recipient != viewer:
                    raise PolicySyntaxError(
                        f"line {statement.line}: letter recipient "
                        "must match the surrounding protocol"
                    )

                letter_id = letter_id_for_title(statement.title)
                release_key = (letter_id, recipient)

                if release_key in release_keys:
                    raise PolicySyntaxError(
                        f"line {statement.line}: duplicate release "
                        "for this letter and recipient"
                    )

                release_keys.add(release_key)

                release_date = statement.on

                add_fact(
                    f"release({letter_id},{recipient},"
                    f"date({release_date.year},"
                    f"{release_date.month},"
                    f"{release_date.day}))."
                )

                releases.append({
                    "id": letter_id,
                    "to": recipient,
                    "title": unicodedata.normalize(
                        "NFC",
                        statement.title,
                    ).strip(),
                    "date": release_date.isoformat(),
                })

            elif isinstance(statement, Custody):
                recipient = checked_name(
                    statement.to,
                    statement.line,
                )

                custody_transfers.append({
                    "to": recipient,
                    "conditions": list(statement.conditions),
                    "status": "declared",
                })

            elif isinstance(statement, Mode):
                if statement.mode not in SUPPORTED_MODES:
                    raise PolicySyntaxError(
                        f"line {statement.line}: unsupported writing mode"
                    )

                if (
                    default_mode is not None
                    and default_mode != statement.mode
                ):
                    raise PolicySyntaxError(
                        f"line {statement.line}: conflicting "
                        "default writing modes"
                    )

                default_mode = statement.mode

            else:
                raise PolicySyntaxError(
                    "Unsupported policy statement"
                )

    default_mode = default_mode or "verbatim"

    return {
        "schema_version": 1,
        "facts": facts,
        "releases": releases,
        "custody_transfers": custody_transfers,
        "default_mode": default_mode,
    }
