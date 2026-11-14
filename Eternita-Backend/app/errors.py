class PolicySyntaxError(ValueError):
    """The policy contains invalid text or syntax."""

class AccessDenied(Exception):
    """Raised when a policy denies a requested action."""