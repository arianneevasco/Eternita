from datetime import date

import pytest

from app.errors import PolicySyntaxError
from app.policy.parser import Custody, Mode, Release, See, parse


POLICY = '''
protocol maria:
    may see existence of entries mentioning maria
    may read summary of entries tagged "family"
    may not read summary of entries tagged "health"
    release letter "To my daughter" to maria when date >= 2040-05-01
    default writing mode: verbatim
'''


def test_complete_policy():
    protocols = parse(POLICY)

    assert len(protocols) == 1
    assert protocols[0].name == "maria"
    assert len(protocols[0].stmts) == 5


def test_existence_rule():
    rule = parse(POLICY)[0].stmts[0]

    assert isinstance(rule, See)
    assert rule.allow is True
    assert rule.kind == "existence"
    assert rule.by == "mentions"
    assert rule.value == "maria"


def test_summary_rule():
    rule = parse(POLICY)[0].stmts[1]

    assert isinstance(rule, See)
    assert rule.allow is True
    assert rule.kind == "summary"
    assert rule.by == "tag"
    assert rule.value == "family"


def test_deny_rule():
    rule = parse(POLICY)[0].stmts[2]

    assert isinstance(rule, See)
    assert rule.allow is False
    assert rule.kind == "summary"
    assert rule.value == "health"


def test_letter_release():
    rule = parse(POLICY)[0].stmts[3]

    assert isinstance(rule, Release)
    assert rule.title == "To my daughter"
    assert rule.to == "maria"
    assert rule.on == date(2040, 5, 1)


def test_default_mode():
    rule = parse(POLICY)[0].stmts[4]

    assert isinstance(rule, Mode)
    assert rule.mode == "verbatim"


def test_simple_custody_transfer():
    protocols = parse('''
protocol maria:
    transfer custody to juan
''')

    rule = protocols[0].stmts[0]

    assert isinstance(rule, Custody)
    assert rule.to == "juan"
    assert rule.conditions == ()


def test_custody_transfer_with_condition():
    protocols = parse('''
protocol maria:
    transfer custody to juan if trustee_unavailable
''')

    rule = protocols[0].stmts[0]

    assert isinstance(rule, Custody)
    assert rule.conditions == ("trustee_unavailable",)


def test_unknown_custody_condition_is_rejected():
    with pytest.raises(
        PolicySyntaxError,
        match="unsupported custody condition",
    ):
        parse('''
protocol maria:
    transfer custody to juan if owner_dies
''')


def test_multiple_protocols():
    source = '''
protocol maria:
    may read summary of entries tagged "family"

protocol juan:
    may see existence of entries mentioning juan
'''

    protocols = parse(source)

    assert [p.name for p in protocols] == ["maria", "juan"]


@pytest.mark.parametrize(
    "source",
    [
        "",
        "# comments only",
        "protocol maria",
        "protocol maria:",
        'protocol maria: may read entries tagged "family"',
        'protocol maria: may read summary of entries tagged family',
        'protocol maria: may read summary of entries tagged "Family Trip"',
        "protocol maria: default writing mode: automatic",
        'protocol maria: release letter "Letter" to maria when date 2040-05-01',
        "protocol maria: may read full entries mentioning maria",
        (
            "protocol maria: may see existence of entries mentioning maria "
            "protocol maria: may see existence of entries mentioning maria"
        ),
    ],
)
def test_invalid_policy_is_rejected(source):
    with pytest.raises(PolicySyntaxError):
        parse(source)


def test_error_has_line_number():
    source = (
        "protocol maria:\n"
        "    fly away\n"
    )

    with pytest.raises(PolicySyntaxError, match=r"line 2:"):
        parse(source)
