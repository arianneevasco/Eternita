import { useRouter } from "expo-router";
import { RegisterScreen } from "../screens/RegisterScreen";

export default function RegisterRoute() {
  const router = useRouter();

  return (
    <RegisterScreen
      onCreateAccount={(username, email) =>
        router.push({
          pathname: "/verify-email",
          params: { username, email },
        })
      }
      onBack={() => router.back()}
    />
  );
}
