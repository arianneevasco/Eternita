import pytest

from app.errors import PolicySyntaxError
from app.policy.interpreter import (
    checked_name,
    compile_policy,
    letter_id_for_title,
)


POLICY = '''
protocol maria:
    may see existence of entries mentioning maria
    may read summary of entries tagged "family"
    may not read summary of entries tagged "health"
    release letter "To my daughter" to maria when date >= 2040-05-01
    default writing mode: verbatim
'''


def test_permission_facts():
    compiled = compile_policy(POLICY)

    assert "allow(maria,existence,mentions(maria))." in compiled["facts"]
    assert "allow(maria,summary,tag(family))." in compiled["facts"]
    assert "deny(maria,summary,tag(health))." in compiled["facts"]


def test_denial_keeps_its_action():
    compiled = compile_policy('''
protocol maria:
    may not read summary of entries tagged "health"
''')

    assert compiled["facts"] == [
        "deny(maria,summary,tag(health))."
    ]


def test_letter_release_fact():
    compiled = compile_policy(POLICY)
    letter_id = letter_id_for_title("To my daughter")

    expected = (
        f"release({letter_id},maria,date(2040,5,1))."
    )

    assert expected in compiled["facts"]

    assert compiled["releases"] == [{
        "id": letter_id,
        "to": "maria",
        "title": "To my daughter",
        "date": "2040-05-01",
    }]


def test_default_mode():
    compiled = compile_policy(POLICY)

    assert compiled["default_mode"] == "verbatim"
    assert compiled["schema_version"] == 1


def test_missing_mode_defaults_to_verbatim():
    compiled = compile_policy('''
protocol maria:
    may see existence of entries mentioning maria
''')

    assert compiled["default_mode"] == "verbatim"


def test_identical_facts_are_deduplicated():
    compiled = compile_policy('''
protocol maria:
    may read summary of entries tagged "family"
    may read summary of entries tagged "family"
''')

    assert compiled["facts"] == [
        "allow(maria,summary,tag(family))."
    ]


def test_allow_and_deny_are_both_preserved():
    compiled = compile_policy('''
protocol maria:
    may read summary of entries tagged "family"
    may not read summary of entries tagged "family"
''')

    assert "allow(maria,summary,tag(family))." in compiled["facts"]
    assert "deny(maria,summary,tag(family))." in compiled["facts"]


def test_conflicting_default_modes_are_rejected():
    source = '''
protocol maria:
    default writing mode: verbatim

protocol juan:
    default writing mode: light_fix
'''

    with pytest.raises(
        PolicySyntaxError,
        match="conflicting default writing modes",
    ):
        compile_policy(source)


def test_repeated_same_default_mode_is_allowed():
    compiled = compile_policy('''
protocol maria:
    default writing mode: verbatim

protocol juan:
    default writing mode: verbatim
''')

    assert compiled["default_mode"] == "verbatim"


def test_release_recipient_must_match_protocol():
    source = '''
protocol maria:
    release letter "A letter" to juan when date >= 2040-05-01
'''

    with pytest.raises(
        PolicySyntaxError,
        match="recipient must match",
    ):
        compile_policy(source)


def test_duplicate_release_is_rejected():
    source = '''
protocol maria:
    release letter "A letter" to maria when date >= 2040-05-01
    release letter "A letter" to maria when date >= 2041-05-01
'''

    with pytest.raises(
        PolicySyntaxError,
        match="duplicate release",
    ):
        compile_policy(source)


def test_letter_ids_do_not_collapse_punctuation():
    assert (
        letter_id_for_title("To Maria!")
        != letter_id_for_title("To Maria?")
    )


def test_letter_id_is_a_safe_identifier():
    letter_id = letter_id_for_title("My daughter's letter!")

    assert letter_id.startswith("letter_")
    assert len(letter_id) == 71
    assert all(
        character in "0123456789abcdef"
        for character in letter_id[7:]
    )


def test_identifier_injection_is_rejected():
    with pytest.raises(PolicySyntaxError):
        checked_name("maria);halt(0", line=1)