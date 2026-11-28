import { useRouter } from "expo-router";
import { RegisterScreen } from "../screens/RegisterScreen";
import { registerOwner } from "../features/account/api";
import { getFirebaseAuth } from "../features/account/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onCreateAccount={async (displayName, email, password) => {
        const auth = getFirebaseAuth();
        const currentUser =
          auth.currentUser?.email?.toLowerCase() === email.trim().toLowerCase()
            ? auth.currentUser
            : null;
        const user =
          currentUser ??
          (
            await createUserWithEmailAndPassword(
              auth,
              email,
              password,
            )
          ).user;
        const idToken = await user.getIdToken();
        await registerOwner(idToken, {
          name: displayName,
          handle: createHandle(displayName),
        });
        router.replace("/owner");
      }}
      onBack={() => router.back()}
    />
  );
}

function createHandle(displayName: string): string {
  return (
    displayName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 31) || "owner"
  );
}
