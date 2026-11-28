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
  email: string;
  password: string;
  displayName: string;
}

export function registerOwner(
  input: RegisterOwnerInput
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/register-owner", {
    method: "POST",
    body: input,
  });
}

export function getCurrentProfile(idToken: string): Promise<UserProfile> {
  return apiRequest<UserProfile>("/auth/me", { idToken });
}
