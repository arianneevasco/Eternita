import { Redirect, useRouter } from "expo-router";
import { getCurrentProfile } from "../features/account/api";
import { useAuth } from "../features/account/AuthContext";
import { assertApiBaseUrlConfigured } from "../api/client";
import {
  refreshAndVerifyFirebaseEmail,
  sendFirebaseVerificationEmail,
} from "../features/account/firebaseAuth";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";

export default function VerifyEmailRoute() {
  const router = useRouter();
  const {
    completeSignIn,
    pendingVerification: currentPendingVerification,
    setPendingVerification,
  } = useAuth();

  if (!currentPendingVerification) {
    return <Redirect href="/sign-in" />;
  }
  const pendingVerification = currentPendingVerification;

  async function confirmEmail() {
    assertApiBaseUrlConfigured();
    const credential = await refreshAndVerifyFirebaseEmail(
      pendingVerification.email,
      pendingVerification.refreshToken
    );
    const profile = await getCurrentProfile(credential.idToken);
    completeSignIn(profile, credential.idToken);
    setPendingVerification(null);
    router.replace(profile.role === "owner" ? "/owner" : "/asker");
  }

  async function resendEmail() {
    await sendFirebaseVerificationEmail(pendingVerification.idToken);
  }

  return (
    <VerifyEmailScreen
      email={pendingVerification.email}
      warning={pendingVerification.warning}
      onConfirm={confirmEmail}
      onResend={resendEmail}
      onBackToSignIn={() => router.replace("/sign-in")}
    />
  );
}
