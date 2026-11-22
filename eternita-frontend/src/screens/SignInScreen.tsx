import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onRegister: () => void;
  onBack: () => void;
};

export function SignInScreen({ onSignIn, onRegister, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.book}>
          <View style={styles.innerBorder}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
            <Text style={styles.brand}>Eternita</Text>
            <Text style={styles.title}>Sign in</Text>
            <View style={styles.form}>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#F0D8B6"
                style={styles.input}
                value={email}
              />
              <View style={styles.passwordRow}>
                <TextInput
                  accessibilityLabel="Password"
                  autoComplete="password"
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#F0D8B6"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowPassword((current) => !current)}
                  style={styles.eyeButton}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#F4D6AE" />
                </Pressable>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton
                title={busy ? "Signing in..." : "Sign in"}
                disabled={busy}
                onPress={submit}
              />
              <Pressable onPress={onRegister} accessibilityRole="button">
                <Text style={styles.link}>Create an account</Text>
              </Pressable>
            </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  book: {
    width: "100%",
    maxWidth: 620,
    minHeight: 680,
    backgroundColor: "#573010",
    padding: 16,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#C38A4D",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    padding: 26,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 1,
  },
  back: {
    color: "#F4D6AE",
    fontSize: 16,
  },
  brand: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 58,
  },
  title: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 28,
    marginTop: 16,
    marginBottom: 36,
  },
  form: { width: "100%", maxWidth: 430 },
  input: {
    height: 58,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#895018",
    backgroundColor: "#A96F35",
    color: "#FFF8EA",
    fontSize: 19,
    paddingHorizontal: 20,
    marginBottom: 17,
  },
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 58,
  },
  eyeButton: {
    position: "absolute",
    top: 0,
    right: 12,
    width: 42,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "#FFD3C5",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4,
  },
  link: {
    color: "#F4D6AE",
    fontSize: 15,
    marginTop: 22,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
