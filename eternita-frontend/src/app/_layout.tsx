import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../features/account/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </AuthProvider>
  );
}
