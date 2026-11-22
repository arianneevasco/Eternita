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
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onSignIn: () => void;
  onBack: () => void;
};

export function RegisterScreen({ onRegister, onSignIn, onBack }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Complete all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await onRegister(name.trim(), email.trim(), password);
    } catch (registerError) {
      setError(
        registerError instanceof Error
          ? registerError.message
          : "Registration failed. Please try again."
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
            <Text style={styles.title}>Register</Text>
            <View style={styles.form}>
              <TextInput
                accessibilityLabel="Username"
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Username"
                placeholderTextColor="#F0D8B6"
                style={styles.input}
                value={name}
              />
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
                  accessibilityLabel="Password (at least 8 characters)"
                  autoComplete="new-password"
                  onChangeText={setPassword}
                  placeholder="Password (Atleast 8 Character)"
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
              <View style={styles.passwordRow}>
                <TextInput
                  accessibilityLabel="Confirm password"
                  autoComplete="new-password"
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  placeholderTextColor="#F0D8B6"
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                  style={styles.eyeButton}
                >
                  <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#F4D6AE" />
                </Pressable>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <PrimaryButton
                title={busy ? "Registering..." : "Register"}
                disabled={busy}
                onPress={submit}
              />
              <Pressable onPress={onSignIn} accessibilityRole="button">
                <Text style={styles.link}>Already registered? Sign in</Text>
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
    minHeight: 700,
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
    padding: 24,
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
    marginTop: 14,
    marginBottom: 28,
  },
  form: { width: "100%", maxWidth: 430 },
  input: {
    height: 56,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: "#895018",
    backgroundColor: "#A96F35",
    color: "#FFF8EA",
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 14,
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
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "#FFD3C5",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 2,
  },
  link: {
    color: "#F4D6AE",
    fontSize: 15,
    marginTop: 18,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
