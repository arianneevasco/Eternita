import { useRouter } from "expo-router";
import { FacePreviewScreen } from "../screens/FacePreviewScreen";

export default function FacePreviewRoute() {
  const router = useRouter();

  return (
    <FacePreviewScreen
      onContinueOwner={() => router.replace("/owner")}
      onContinueAsker={() => router.replace("/asker")}
      onBack={() => router.back()}
    />
  );
}
