import { useLocalSearchParams, useRouter } from "expo-router";
import { FacePreviewScreen } from "../screens/FacePreviewScreen";

export default function FacePreviewRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string }>();
  const username = typeof params.username === "string" ? params.username : "";

  return (
    <FacePreviewScreen
      username={username}
      onContinueOwner={() => router.replace("/owner")}
      onContinueAsker={() => router.replace("/asker")}
      onBack={() => router.back()}
    />
  );
}
