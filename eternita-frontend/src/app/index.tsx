import { useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

export default function StartRoute() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.book}>
          <View style={styles.innerBorder}>
            <Text style={styles.brand}>Eternita</Text>
            <Text style={styles.subtitle}>My Personal Diary</Text>
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>BEFORE YOU START</Text>
              <Text style={styles.noticeBody}>
                1. Register your account{"\n"}
                2. Verify your email{"\n"}
                3. From then on, sign in with your email and password
              </Text>
            </View>
            <View style={styles.legalNote}>
              <Text style={styles.legalText}>
                ⚖ The Letter of Wishes is a personal message, not a legal will.
                Philippine law has formal requirements for wills.
              </Text>
            </View>
            <PrimaryButton
              title="Get Started"
              onPress={() => router.push("/register")}
            />
            <Pressable onPress={() => router.push("/sign-in")} accessibilityRole="button">
              <Text style={styles.signInLink}>Already have an account? Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  book: {
    width: "100%",
    maxWidth: 620,
    minHeight: 700,
    backgroundColor: "#573010",
    padding: 16,
    borderRadius: 4,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#C38A4D",
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  brand: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 64,
    textShadowColor: "#241205",
    textShadowOffset: { width: 5, height: 7 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 24,
    marginTop: 16,
    marginBottom: 42,
  },
  notice: {
    width: "100%",
    padding: 20,
    backgroundColor: "#895018",
    borderRadius: 17,
  },
  noticeTitle: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 15,
    marginBottom: 12,
  },
  noticeBody: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 19,
    lineHeight: 29,
  },
  legalNote: {
    width: "100%",
    padding: 18,
    marginTop: 16,
    backgroundColor: "#895018",
    borderRadius: 17,
  },
  legalText: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 20,
  },
  signInLink: {
    color: "#F4D6AE",
    fontSize: 15,
    marginTop: 18,
    textDecorationLine: "underline",
  },
});
