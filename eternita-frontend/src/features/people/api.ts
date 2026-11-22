import { apiRequest } from "../../api/client";
import type { UserProfile } from "../account/api";

export interface CreateInviteInput {
  handle: string;
  name: string;
}

export interface Invite {
  inviteId: string;
  code: string;
  handle: string;
  name: string;
  expiresAt: string;
}

export interface JoinInput {
  code: string;
  name: string;
}

export interface Person extends UserProfile {
  deceased: boolean;
}

export function createInvite(
  idToken: string,
  input: CreateInviteInput
): Promise<Invite> {
  return apiRequest<Invite>("/invites", {
    method: "POST",
    idToken,
    body: input,
  });
}

export function joinWithInvite(
  idToken: string,
  input: JoinInput
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/join", {
    method: "POST",
    idToken,
    body: input,
  });
}

export function listPeople(idToken: string): Promise<{ people: Person[] }> {
  return apiRequest<{ people: Person[] }>("/people", { idToken });
}
