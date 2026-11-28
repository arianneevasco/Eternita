import { useRouter } from "expo-router";
import { SignInScreen } from "../screens/SignInScreen";
import { getFirebaseAuth } from "../features/account/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getCurrentProfile } from "../features/account/api";

export default function SignInRoute() {
  const router = useRouter();
  return (
    <SignInScreen
      onSignIn={async (email, password) => {
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        const profile = await getCurrentProfile(await credential.user.getIdToken());
        if (profile.role !== "owner") {
          throw new Error("This account is not registered as an owner.");
        }
        router.replace("/owner");
      }}
      onRegister={() => router.push("/register")}
    />
  );
}
