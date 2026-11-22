import { useRouter } from "expo-router";
import { WelcomeScreen } from "../screens/WelcomeScreen";

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onGetStarted={() => router.push("/register")}
      onSignIn={() => router.push("/sign-in")}
    />
  );
}
