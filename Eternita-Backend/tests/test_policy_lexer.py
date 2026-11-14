import pytest

from app.errors import PolicySyntaxError
from app.policy.lexer import tokenize


def test_protocol_header():
    tokens = tokenize("protocol maria:")

    assert [(t.kind, t.value) for t in tokens] == [
        ("WORD", "protocol"),
        ("WORD", "maria"),
        ("COLON", ":"),
        ("END", ""),
    ]


def test_quoted_text_preserves_case():
    tokens = tokenize('release letter "To My Daughter"')

    strings = [t.value for t in tokens if t.kind == "STRING"]

    assert strings == ["To My Daughter"]


def test_words_become_lowercase():
    tokens = tokenize("PROTOCOL Maria:")

    assert tokens[0].value == "protocol"
    assert tokens[1].value == "maria"


def test_date_and_comparison():
    tokens = tokenize("when date >= 2040-05-01")

    assert ("GE", ">=") in [
        (t.kind, t.value) for t in tokens
    ]
    assert ("DATE", "2040-05-01") in [
        (t.kind, t.value) for t in tokens
    ]


def test_comments_are_ignored():
    tokens = tokenize(
        "# owner policy\nprotocol maria: # recipient\n"
    )

    assert [t.value for t in tokens if t.kind == "WORD"] == [
        "protocol",
        "maria",
    ]


def test_line_numbers():
    tokens = tokenize(
        "protocol maria:\n"
        '    may read summary of entries tagged "family"\n'
    )

    may = next(t for t in tokens if t.value == "may")

    assert may.line == 2


def test_number():
    tokens = tokenize("90")

    assert tokens[0].kind == "NUMBER"
    assert tokens[0].value == "90"


@pytest.mark.parametrize(
    "source",
    [
        'release letter "unfinished',
        'entries tagged ""',
        "when date >= 2040-13-01",
        "when date >= 2040-02-30",
        "when date >= 2040-5-1",
        "protocol maria: @",
        'entries tagged "family\nhealth"',
    ],
)
def test_invalid_input_is_rejected(source):
    with pytest.raises(PolicySyntaxError):
        tokenize(source)