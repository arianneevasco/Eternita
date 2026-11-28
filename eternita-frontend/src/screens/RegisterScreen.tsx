import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  onCreateAccount: (username: string, email: string, password: string) => Promise<void>;
  onBack: () => void;
};

export function RegisterScreen({ onCreateAccount, onBack }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { height, width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isCompact = !isDesktop && height < 760;

  async function submit() {
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
    setIsSubmitting(true);
    try {
      await onCreateAccount(cleanUsername, cleanEmail, password);
    } catch (registerError) {
      const code = (registerError as { code?: string })?.code;
      setError(
        code === "auth/email-already-in-use"
          ? "An account already uses this email. Please sign in."
          : registerError instanceof Error
            ? registerError.message
            : "We could not create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <EternitaFrame>
      <View
        style={[
          styles.content,
          isDesktop && styles.desktopContent,
          isCompact && styles.compactContent,
        ]}
      >
        <View
          style={[
            styles.hero,
            isDesktop && styles.desktopHero,
            isCompact && styles.compactHero,
          ]}
        >
          <Text
            style={[
              styles.brand,
              isDesktop && styles.desktopBrand,
              isCompact && styles.compactBrand,
            ]}
          >
            Eternita
          </Text>
          <Text style={[styles.title, isCompact && styles.compactTitle]}>
            Register
          </Text>
          {isDesktop ? (
            <>
              <Text style={styles.note}>
                Use an invented name and fiction details. The PIN is only a
                backup if your face not recognized.
              </Text>
              <Text style={styles.demoNote}>
                Your account is created with Firebase secure sign-in.
              </Text>
            </>
          ) : null}
        </View>

        <View
          style={[
            styles.form,
            isDesktop && styles.desktopForm,
            isCompact && styles.compactForm,
          ]}
        >
          <TextInput
            accessibilityLabel="Username"
            autoCapitalize="words"
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor="#FFF1DD"
            style={[styles.input, isCompact && styles.compactInput]}
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
            style={[styles.input, isCompact && styles.compactInput]}
            value={email}
          />
          <View
            style={[
              styles.passwordField,
              isCompact && styles.compactPasswordField,
            ]}
          >
            <TextInput
              accessibilityLabel="Password (Atleast 8 Character)"
              autoComplete="new-password"
              onChangeText={setPassword}
              placeholder="Password (Atleast 8 Character)"
              placeholderTextColor="#FFF1DD"
              secureTextEntry={!showPasswords}
              style={[
                styles.passwordInput,
                isCompact && styles.compactPasswordInput,
              ]}
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                showPasswords ? "Hide passwords" : "Show passwords"
              }
              hitSlop={8}
              onPress={() => setShowPasswords((visible) => !visible)}
            >
              <Feather
                name={showPasswords ? "eye-off" : "eye"}
                size={20}
                color="#FFF7EA"
              />
            </Pressable>
          </View>
          <View
            style={[
              styles.passwordField,
              isCompact && styles.compactPasswordField,
            ]}
          >
            <TextInput
              accessibilityLabel="Confirm password"
              autoComplete="new-password"
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#FFF1DD"
              secureTextEntry={!showPasswords}
              style={[
                styles.passwordInput,
                isCompact && styles.compactPasswordInput,
              ]}
              value={confirmPassword}
            />
          </View>

          {!isDesktop ? (
            <Text style={[styles.note, isCompact && styles.compactNote]}>
              Use an invented name and fiction details. The PIN is only a
              backup if your face not recognized.
            </Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <EternitaButton
            title={isSubmitting ? "Creating account..." : "Create Account"}
            onPress={submit}
            disabled={isSubmitting}
          />
          {!isDesktop ? (
            <Text
              style={[styles.demoNote, isCompact && styles.compactDemoNote]}
            >
              Your account is created with Firebase secure sign-in.
            </Text>
          ) : null}
          <EternitaButton title="Back" onPress={onBack} variant="secondary" />
        </View>
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
  desktopContent: {
    maxWidth: 1120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 72,
  },
  compactContent: {
    gap: 8,
  },
  hero: {
    gap: 14,
  },
  desktopHero: {
    flex: 1,
  },
  compactHero: {
    gap: 8,
  },
  form: {
    gap: 14,
  },
  desktopForm: {
    flex: 1,
    maxWidth: 560,
  },
  compactForm: {
    gap: 8,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 54,
    textAlign: "center",
  },
  desktopBrand: {
    fontSize: 80,
    textAlign: "left",
  },
  compactBrand: {
    fontSize: 46,
  },
  title: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 22,
    marginBottom: 8,
    textAlign: "center",
  },
  compactTitle: {
    fontSize: 18,
    marginBottom: 0,
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
  compactInput: {
    minHeight: 44,
    fontSize: 14,
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
  compactPasswordField: {
    minHeight: 44,
  },
  passwordInput: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    minHeight: 48,
    color: "#FFF7EA",
    fontSize: 14,
  },
  compactPasswordInput: {
    minHeight: 40,
    fontSize: 12,
  },
  note: {
    color: "#FFF1DD",
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 19,
  },
  compactNote: {
    fontSize: 12,
    lineHeight: 16,
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
  compactDemoNote: {
    fontSize: 11,
    lineHeight: 14,
  },
});
