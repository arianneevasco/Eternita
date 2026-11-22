import { useRouter } from "expo-router";
import { SignInScreen } from "../screens/SignInScreen";

export default function SignInRoute() {
  const router = useRouter();

  return (
    <SignInScreen
      onPreviewOwner={() => router.push("/owner")}
      onPreviewAsker={() => router.push("/asker")}
    />
  );
}
