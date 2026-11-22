import { useLocalSearchParams, useRouter } from "expo-router";
import { SignInScreen } from "../screens/SignInScreen";

export default function SignInRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string }>();
  const username = typeof params.username === "string" ? params.username : "";

  return (
    <SignInScreen
      username={username}
      onSignIn={(enteredUsername) =>
        router.push({
          pathname: "/face-check",
          params: { username: enteredUsername },
        })
      }
      onRegister={() => router.push("/register")}
      onPreviewOwner={() => router.push("/owner")}
      onPreviewAsker={() => router.push("/asker")}
    />
  );
}
