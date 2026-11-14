from dataclasses import dataclass
from datetime import date

from app.errors import PolicySyntaxError


MAX_POLICY_LENGTH = 20000


@dataclass(frozen=True)
class Token:
    kind: str
    value: str
    line: int


def tokenize(text: str) -> list[Token]:
    if len(text) > MAX_POLICY_LENGTH:
        raise PolicySyntaxError(
            f"Policy exceeds {MAX_POLICY_LENGTH} characters"
        )

    tokens = []
    i = 0
    line = 1

    while i < len(text):
        ch = text[i]

        if ch == "\n":
            line += 1
            i += 1
            continue

        if ch.isspace():
            i += 1
            continue

        if ch == "#":
            while i < len(text) and text[i] != "\n":
                i += 1
            continue

        if ch == ":":
            tokens.append(Token("COLON", ":", line))
            i += 1
            continue

        if text.startswith(">=", i):
            tokens.append(Token("GE", ">=", line))
            i += 2
            continue

        if ch == '"':
            start = i + 1
            end = start

            while end < len(text) and text[end] not in ('"', "\n", "\r"):
                end += 1

            if end >= len(text) or text[end] != '"':
                raise PolicySyntaxError(
                    f"line {line}: unterminated string"
                )

            value = text[start:end]

            if not value.strip():
                raise PolicySyntaxError(
                    f"line {line}: quoted text must not be empty"
                )

            tokens.append(Token("STRING", value, line))
            i = end + 1
            continue

        if ch in "0123456789":
            start = i

            while i < len(text) and text[i] in "0123456789-":
                i += 1

            raw = text[start:i]

            if raw.isdigit():
                tokens.append(Token("NUMBER", raw, line))
                continue

            if (
                len(raw) != 10
                or raw[4] != "-"
                or raw[7] != "-"
            ):
                raise PolicySyntaxError(
                    f"line {line}: invalid number or date {raw!r}"
                )

            try:
                date.fromisoformat(raw)
            except ValueError:
                raise PolicySyntaxError(
                    f"line {line}: invalid date {raw!r}"
                ) from None

            tokens.append(Token("DATE", raw, line))
            continue

        if ch in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ":
            start = i
            i += 1

            while (
                i < len(text)
                and text[i]
                in "abcdefghijklmnopqrstuvwxyz"
                   "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                   "0123456789_"
            ):
                i += 1

            tokens.append(
                Token("WORD", text[start:i].lower(), line)
            )
            continue

        raise PolicySyntaxError(
            f"line {line}: unexpected character {ch!r}"
        )

    tokens.append(Token("END", "", line))
    return tokens