from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from app.services.policy import (
    compile_source,
    freeze_policy,
    get_policy,
    save_policy,
)


VALID_POLICY = '''
protocol maria:
    may read summary of entries tagged "family"
    may not read summary of entries tagged "health"
'''

INVALID_POLICY = '''
protocol maria:
    may read entries tagged family
'''


def test_invalid_policy_returns_422():
    with pytest.raises(HTTPException) as error:
        compile_source(INVALID_POLICY)

    assert error.value.status_code == 422


def test_valid_policy_compiles():
    compiled = compile_source(VALID_POLICY)

    assert "allow(maria,summary,tag(family))." in compiled["facts"]
    assert "deny(maria,summary,tag(health))." in compiled["facts"]
    assert compiled["default_mode"] == "verbatim"