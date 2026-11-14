import json

from app.policy.interpreter import compile_policy


POLICY = '''
protocol maria:
    may see existence of entries mentioning maria
    may read summary of entries tagged "family"
    may not read summary of entries tagged "health"
    default writing mode: verbatim
'''


if __name__ == "__main__":
    result = compile_policy(POLICY)
    print(json.dumps(result, indent=2))