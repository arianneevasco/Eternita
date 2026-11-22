import { apiRequest } from "../../api/client";

export type UserRole = "owner" | "recipient";

export interface UserSettings {
  reminderTime: string;
  autoLockMinutes: number;
  darkMode: boolean;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  handle: string;
  ownerUid?: string;
  settings?: UserSettings;
}

export interface RegisterOwnerInput {
  name: string;
  handle: string;
}

export function registerOwner(
  idToken: string,
  input: RegisterOwnerInput
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/register-owner", {
    method: "POST",
    idToken,
    body: input,
  });
}

export function getCurrentProfile(idToken: string): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/me", { idToken });
}
