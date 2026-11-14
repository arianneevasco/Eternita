import re
from dataclasses import dataclass
from datetime import date

from app.errors import PolicySyntaxError
from app.policy.lexer import tokenize


NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,30}$")
MODES = {"verbatim", "light_fix", "review"}


@dataclass(frozen=True)
class See:
    allow: bool
    kind: str
    by: str
    value: str
    line: int


@dataclass(frozen=True)
class Release:
    title: str
    to: str
    on: date
    line: int


@dataclass(frozen=True)
class Mode:
    mode: str
    line: int


@dataclass(frozen=True)
class Custody:
    to: str
    conditions: tuple[str, ...]
    line: int


Statement = See | Release | Mode | Custody


@dataclass(frozen=True)
class Protocol:
    name: str
    stmts: tuple[Statement, ...]
    line: int


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.i = 0

    def peek(self):
        return self.tokens[self.i]

    def advance(self):
        token = self.peek()

        if token.kind != "END":
            self.i += 1

        return token

    def fail(self, message, line=None):
        if line is None:
            line = self.peek().line

        raise PolicySyntaxError(f"line {line}: {message}")

    def is_word(self, value):
        token = self.peek()

        return token.kind == "WORD" and token.value == value

    def word(self, *values):
        for value in values:
            if not self.is_word(value):
                found = self.peek().value or "end of policy"
                self.fail(
                    f"expected {value!r}, found {found!r}"
                )

            self.advance()

    def take(self, kind):
        token = self.peek()

        if token.kind != kind:
            self.fail(
                f"expected {kind}, found {token.kind}"
            )

        return self.advance()

    def name(self):
        token = self.take("WORD")

        if not NAME_PATTERN.fullmatch(token.value):
            self.fail(
                "name must start with a lowercase letter and "
                "contain at most 31 lowercase letters, digits, "
                "or underscores",
                token.line,
            )

        return token.value

    def program(self):
        protocols = []
        names = set()

        while self.peek().kind != "END":
            protocol = self.protocol()

            if protocol.name in names:
                self.fail(
                    f"duplicate protocol for {protocol.name!r}",
                    protocol.line,
                )

            names.add(protocol.name)
            protocols.append(protocol)

        if not protocols:
            self.fail("policy is empty")

        return tuple(protocols)

    def protocol(self):
        start = self.peek()
        self.word("protocol")
        name = self.name()
        self.take("COLON")

        statements = []

        while (
            self.peek().kind != "END"
            and not self.is_word("protocol")
        ):
            statements.append(self.statement())

        if not statements:
            self.fail(
                f"protocol {name!r} has no statements",
                start.line,
            )

        return Protocol(
            name=name,
            stmts=tuple(statements),
            line=start.line,
        )

    def statement(self):
        if self.is_word("may"):
            return self.see()

        if self.is_word("release"):
            return self.release()

        if self.is_word("default"):
            return self.mode()

        if self.is_word("transfer"):
            return self.custody()

        found = self.peek().value or "end of policy"
        self.fail(
            f"unsupported statement starting with {found!r}"
        )

    def see(self):
        start = self.peek()
        self.word("may")

        allow = True

        if self.is_word("not"):
            self.advance()
            allow = False

        if self.is_word("see"):
            self.word("see", "existence", "of")
            kind = "existence"
        elif self.is_word("read"):
            self.word("read", "summary", "of")
            kind = "summary"
        else:
            self.fail(
                "expected 'see existence of' or 'read summary of'"
            )

        self.word("entries")

        if self.is_word("mentioning"):
            self.advance()
            by = "mentions"
            value = self.name()

        elif self.is_word("tagged"):
            self.advance()
            tag = self.take("STRING")

            if not NAME_PATTERN.fullmatch(tag.value):
                self.fail(
                    "tag must be a lowercase identifier, "
                    'for example "family" or "family_trip"',
                    tag.line,
                )

            by = "tag"
            value = tag.value

        else:
            self.fail("expected 'mentioning' or 'tagged'")

        return See(
            allow=allow,
            kind=kind,
            by=by,
            value=value,
            line=start.line,
        )

    def release(self):
        start = self.peek()

        self.word("release", "letter")
        title = self.take("STRING")

        if len(title.value) > 200:
            self.fail(
                "letter title exceeds 200 characters",
                title.line,
            )

        self.word("to")
        recipient = self.name()

        self.word("when", "date")
        self.take("GE")
        date_token = self.take("DATE")

        try:
            release_date = date.fromisoformat(date_token.value)
        except ValueError:
            self.fail("invalid release date", date_token.line)

        return Release(
            title=title.value,
            to=recipient,
            on=release_date,
            line=start.line,
        )

    def mode(self):
        start = self.peek()

        self.word("default", "writing", "mode")
        self.take("COLON")
        mode = self.take("WORD")

        if mode.value not in MODES:
            self.fail(
                "writing mode must be verbatim, light_fix, or review",
                mode.line,
            )

        return Mode(
            mode=mode.value,
            line=start.line,
        )

    def custody(self):
        start = self.peek()

        self.word("transfer", "custody", "to")
        recipient = self.name()

        conditions = []

        while self.is_word("if"):
            self.advance()
            condition = self.take("WORD")

            if condition.value != "trustee_unavailable":
                self.fail(
                    "unsupported custody condition; "
                    "only 'trustee_unavailable' is accepted",
                    condition.line,
                )

            conditions.append(condition.value)

        return Custody(
            to=recipient,
            conditions=tuple(conditions),
            line=start.line,
        )


def parse(text: str) -> tuple[Protocol, ...]:
    return Parser(tokenize(text)).program()
