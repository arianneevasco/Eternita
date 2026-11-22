import { useRouter } from "expo-router";
import { assertApiBaseUrlConfigured } from "../api/client";
import { getCurrentProfile, registerOwner } from "../features/account/api";
import { useAuth } from "../features/account/AuthContext";
import {
  createFirebaseAccount,
  FirebaseAuthError,
  sendFirebaseVerificationEmail,
  signInWithFirebase,
} from "../features/account/firebaseAuth";
import { RegisterScreen } from "../screens/RegisterScreen";

function toHandle(name: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 31);
  return /^[a-z]/.test(normalized) ? normalized : `user_${normalized}`.slice(0, 31);
}

export default function RegisterRoute() {
  const router = useRouter();
  const { setPendingVerification } = useAuth();

  async function register(name: string, email: string, password: string) {
    assertApiBaseUrlConfigured();
    let credential;
    try {
      credential = await createFirebaseAccount(email, password);
    } catch (error) {
      if (!(error instanceof FirebaseAuthError) || error.code !== "EMAIL_EXISTS") {
        throw error;
      }
      credential = await signInWithFirebase(email, password);
    }

    let profile;
    try {
      profile = await registerOwner(credential.idToken, {
        name,
        handle: toHandle(name),
      });
    } catch (error) {
      try {
        profile = await getCurrentProfile(credential.idToken);
      } catch (profileError) {
        const detail = error instanceof Error ? error.message : "Unknown backend error.";
        const lookupDetail =
          profileError instanceof Error ? profileError.message : "Unknown profile lookup error.";
        throw new Error(
          `Your Firebase account exists, but its owner profile could not be confirmed. Registration: ${detail} Profile check: ${lookupDetail}. Check the backend connection and try Register again.`
        );
      }
    }
    if (profile.role !== "owner") {
      throw new Error("This Firebase account is already registered as an asker.");
    }

    let warning: string | undefined;
    try {
      await sendFirebaseVerificationEmail(credential.idToken);
    } catch (error) {
      warning =
        error instanceof Error
          ? `Account created, but Firebase could not send the verification email: ${error.message}`
          : "Account created, but Firebase could not send the verification email.";
    }

    setPendingVerification({
      email: credential.email,
      idToken: credential.idToken,
      refreshToken: credential.refreshToken,
      warning,
    });
    router.replace("/verify-email");
  }

  return (
    <RegisterScreen
      onRegister={register}
      onSignIn={() => router.replace("/sign-in")}
      onBack={() => router.replace("/")}
    />
  );
}
