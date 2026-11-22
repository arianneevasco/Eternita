import { useLocalSearchParams, useRouter } from "expo-router";
import { VerifyEmailScreen } from "../screens/VerifyEmailScreen";

export default function VerifyEmailRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string; email?: string }>();
  const username = typeof params.username === "string" ? params.username : "";
  const email = typeof params.email === "string" ? params.email : "";

  return (
    <VerifyEmailScreen
      username={username}
      email={email}
      onConfirm={() =>
        router.replace({
          pathname: "/sign-in",
          params: { username, email },
        })
      }
      onBack={() => router.back()}
    />
  );
}
