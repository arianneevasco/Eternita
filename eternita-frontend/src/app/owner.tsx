import { useRouter } from "expo-router";
import { OwnerHomeScreen } from "../screens/owner/OwnerHomeScreen";

export default function OwnerHomeRoute() {
  const router = useRouter();

  return <OwnerHomeScreen onSignOut={() => router.replace("/")} />;
}
