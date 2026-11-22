import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../features/account/AuthContext";
import { AskerHomeScreen } from "../screens/asker/AskerHomeScreen";

export default function AskerHomeRoute() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  if (!profile) {
    return <Redirect href="/sign-in" />;
  }
  if (profile.role !== "recipient") {
    return <Redirect href="/owner" />;
  }

  return (
    <AskerHomeScreen
      onSignOut={() => {
        signOut();
        router.replace("/");
      }}
    />
  );
}
