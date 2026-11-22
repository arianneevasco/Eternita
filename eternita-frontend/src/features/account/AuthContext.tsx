import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { UserProfile } from "./api";
import type { FirebaseCredential } from "./firebaseAuth";

type PendingVerification = Pick<
  FirebaseCredential,
  "email" | "idToken" | "refreshToken"
> & { warning?: string };

type AuthContextValue = {
  profile: UserProfile | null;
  idToken: string | null;
  pendingVerification: PendingVerification | null;
  completeSignIn: (profile: UserProfile, idToken: string) => void;
  setPendingVerification: (pending: PendingVerification | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      idToken,
      pendingVerification,
      completeSignIn: (nextProfile, nextIdToken) => {
        setProfile(nextProfile);
        setIdToken(nextIdToken);
      },
      setPendingVerification,
      signOut: () => {
        setProfile(null);
        setIdToken(null);
        setPendingVerification(null);
      },
    }),
    [idToken, pendingVerification, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
