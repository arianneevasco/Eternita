% Eternita access rules.
%
% Facts supplied by the policy compiler:
%   allow(Viewer, Action, Topic).
%   deny(Viewer, Action, Topic).
%
% Topics:
%   mentions(Name)
%   tag(Tag)
%
% Actions:
%   existence
%   summary

% A matching explicit denial always blocks access.
denied(Viewer, Action, Topic) :-
    deny(Viewer, Action, Topic).

% Without an explicit allow rule, access is denied.
denied(Viewer, Action, Topic) :-
    \+ allow(Viewer, Action, Topic).

% Access is permitted only when an allow rule matches
% and no matching deny rule applies.
permitted(Viewer, Action, Topic) :-
    allow(Viewer, Action, Topic),
    \+ deny(Viewer, Action, Topic).