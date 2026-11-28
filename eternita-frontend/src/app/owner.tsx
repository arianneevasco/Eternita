import { useRouter } from "expo-router";
import { OwnerHomeScreen } from "../screens/owner/OwnerHomeScreen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  getFirebaseAuth,
  onIdTokenChanged,
  signOut,
} from "../features/account/firebase";

export default function OwnerHomeRoute() {
  const router = useRouter();
  const [idToken, setIdToken] = useState<string>();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    try {
      unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (user) => {
        if (!user) {
          router.replace("/sign-in");
          return;
        }
        try {
          const token = await user.getIdToken();
          if (!active) return;
          setIdToken(token);
          setAuthReady(true);
        } catch {
          await signOut(getFirebaseAuth());
          router.replace("/sign-in");
        }
      });
    } catch {
      router.replace("/sign-in");
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F3E6D1" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <OwnerHomeScreen
      idToken={idToken}
      onSignOut={async () => {
        await signOut(getFirebaseAuth());
        router.replace("/sign-in");
      }}
      onNavigateToAsker={() => router.replace("/asker")}
    />
  );
}
