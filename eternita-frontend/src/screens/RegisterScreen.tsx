import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  onCreateAccount: (username: string, email: string) => void;
  onBack: () => void;
};

export function RegisterScreen({ onCreateAccount, onBack }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");

  function submit() {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError("Complete all fields to continue.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email address.");
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

    setError("");
    onCreateAccount(cleanUsername, cleanEmail);
  }

  return (
    <EternitaFrame>
      <View style={styles.content}>
        <Text style={styles.brand}>Eternita</Text>
        <Text style={styles.title}>Register</Text>

        <TextInput
          accessibilityLabel="Username"
          autoCapitalize="words"
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#FFF1DD"
          style={styles.input}
          value={username}
        />
        <TextInput
          accessibilityLabel="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#FFF1DD"
          style={styles.input}
          value={email}
        />
        <View style={styles.passwordField}>
          <TextInput
            accessibilityLabel="Password (Atleast 8 Character)"
            autoComplete="new-password"
            onChangeText={setPassword}
            placeholder="Password (Atleast 8 Character)"
            placeholderTextColor="#FFF1DD"
            secureTextEntry={!showPasswords}
            style={styles.passwordInput}
            value={password}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPasswords ? "Hide passwords" : "Show passwords"}
            onPress={() => setShowPasswords((visible) => !visible)}
          >
            <Text style={styles.showLabel}>{showPasswords ? "Hide" : "Show"}</Text>
          </Pressable>
        </View>
        <View style={styles.passwordField}>
          <TextInput
            accessibilityLabel="Confirm password"
            autoComplete="new-password"
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#FFF1DD"
            secureTextEntry={!showPasswords}
            style={styles.passwordInput}
            value={confirmPassword}
          />
        </View>

        <Text style={styles.note}>
          Use an invented name and fiction details. The PIN is only a backup if
          your face not recognized.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <EternitaButton title="Create Account" onPress={submit} />
        <Text style={styles.demoNote}>
          Frontend preview only. No account is created or sent to a server.
        </Text>
        <EternitaButton title="Back" onPress={onBack} variant="secondary" />
      </View>
    </EternitaFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    justifyContent: "center",
    gap: 14,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 54,
    textAlign: "center",
  },
  title: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 22,
    marginBottom: 8,
    textAlign: "center",
  },
  input: {
    minHeight: 52,
    borderWidth: 2,
    borderColor: "#965316",
    borderRadius: 14,
    backgroundColor: "#B8752F",
    color: "#FFF7EA",
    fontSize: 16,
    paddingHorizontal: 16,
  },
  passwordField: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#965316",
    borderRadius: 14,
    backgroundColor: "#B8752F",
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    minHeight: 48,
    color: "#FFF7EA",
    fontSize: 16,
  },
  showLabel: {
    color: "#FFF7EA",
    fontSize: 13,
    fontWeight: "600",
    paddingLeft: 8,
  },
  note: {
    color: "#FFF1DD",
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 19,
  },
  error: {
    color: "#FFD1C8",
    fontSize: 14,
    textAlign: "center",
  },
  demoNote: {
    color: "#D8BE9E",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
