% People
person(maria).
person(ana).

% Entry owners
owner(maria, entry_1).
owner(maria, entry_2).

% Entries
entry(entry_1).
entry(entry_2).

% Entry tags
tag(entry_1, family).
tag(entry_1, travel).
tag(entry_2, birthday).

% Protocols
protocol(protocol_1).
protocol(protocol_2).

% A protocol links an owner and beneficiary.
protocol_for(protocol_1, maria, ana).
protocol_for(protocol_2, maria, ana).

% Grants
grant(protocol_1, entry_1, existence).
grant(protocol_2, entry_2, summary).

% A person has no access unless a grant explicitly allows it.
access(Person, Entry, none) :-
    \+ grant(_, Entry, _),
    \+ protocol_for(_, _, Person).

% Existence access means the person can know that an entry exists.
access(Person, Entry, existence) :-
    person(Person),
    entry(Entry),
    protocol_for(Protocol, Owner, Person),
    owner(Owner, Entry),
    grant(Protocol, Entry, existence).

% Summary access means the person can see limited information.
access(Person, Entry, summary) :-
    person(Person),
    entry(Entry),
    protocol_for(Protocol, Owner, Person),
    owner(Owner, Entry),
    grant(Protocol, Entry, summary).

% Full access means the person can see the complete entry.
access(Person, Entry, full) :-
    person(Person),
    entry(Entry),
    protocol_for(Protocol, Owner, Person),
    owner(Owner, Entry),
    grant(Protocol, Entry, full).

% Deny-by-default: if no grant gives access, deny everything.
deny_access(Person, Entry) :-
    \+ access(Person, Entry, existence),
    \+ access(Person, Entry, summary),
    \+ access(Person, Entry, full).

can_view_existence(Person, Entry) :-
    access(Person, Entry, existence).

can_view_summary(Person, Entry) :-
    access(Person, Entry, summary).

can_view_full(Person, Entry) :-
    access(Person, Entry, full).

    % Ana has existence access to entry_1.
?- access(ana, entry_1, existence).

% Ana has summary access to entry_2.
?- access(ana, entry_2, summary).

% Ana does not have full access to entry_1.
?- \+ access(ana, entry_1, full).

% Ana does not have access to a nonexistent entry.
?- \+ access(ana, entry_3, existence).

% A person with no protocol is denied everything.
?- deny_access(carlos, entry_1).