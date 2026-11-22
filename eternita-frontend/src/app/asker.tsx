import { useRouter } from "expo-router";
import { AskerHomeScreen } from "../screens/asker/AskerHomeScreen";

export default function AskerHomeRoute() {
  const router = useRouter();

  return <AskerHomeScreen onSignOut={() => router.replace("/")} />;
}
