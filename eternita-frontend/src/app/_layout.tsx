import { BodoniModa_400Regular } from "@expo-google-fonts/bodoni-moda";
import { Caveat_400Regular } from "@expo-google-fonts/caveat";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    EternitaDisplay: BodoniModa_400Regular,
    EternitaScript: Caveat_400Regular,
  });

  if (fontError) {
    throw fontError;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
