import { useRouter } from "expo-router";
import { RegisterScreen } from "../screens/RegisterScreen";
import { getCurrentProfile, registerOwner } from "../features/account/api";
import { getFirebaseAuth } from "../features/account/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onCreateAccount={async (displayName, email, password) => {
        await registerOwner({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        });
        // The backend creates the Firebase Auth account and Firestore profile.
        // Sign in only after registration succeeds, then verify the authenticated
        // profile through the protected API before entering the owner area.
        const credential = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email.trim(),
          password,
        );
        await getCurrentProfile(await credential.user.getIdToken());
        router.replace("/owner");
      }}
      onBack={() => router.back()}
    />
  );
}
