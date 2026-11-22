import { useRouter } from "expo-router";
import { SignInScreen } from "../screens/SignInScreen";
import { useAuth } from "../features/account/AuthContext";
import { getCurrentProfile } from "../features/account/api";
import { assertApiBaseUrlConfigured } from "../api/client";
import {
  isFirebaseEmailVerified,
  signInWithFirebase,
} from "../features/account/firebaseAuth";

export default function SignInRoute() {
  const router = useRouter();
  const { completeSignIn } = useAuth();

  async function signIn(email: string, password: string) {
    assertApiBaseUrlConfigured();
    const credential = await signInWithFirebase(email, password);
    if (!(await isFirebaseEmailVerified(credential.idToken))) {
      throw new Error("Verify your email before signing in.");
    }

    const profile = await getCurrentProfile(credential.idToken);
    completeSignIn(profile, credential.idToken);
    router.replace(profile.role === "owner" ? "/owner" : "/asker");
  }

  return (
    <SignInScreen
      onSignIn={signIn}
      onRegister={() => router.push("/register")}
      onBack={() => router.replace("/")}
    />
  );
}
