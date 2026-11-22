import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../features/account/AuthContext";
import { OwnerHomeScreen } from "../screens/owner/OwnerHomeScreen";

export default function OwnerHomeRoute() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  if (!profile) {
    return <Redirect href="/sign-in" />;
  }
  if (profile.role !== "owner") {
    return <Redirect href="/asker" />;
  }

  return (
    <OwnerHomeScreen
      onSignOut={() => {
        signOut();
        router.replace("/");
      }}
    />
  );
}
