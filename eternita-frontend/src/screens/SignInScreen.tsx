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
  username?: string;
  onSignIn: (email: string, password: string) => Promise<void>;
  onRegister: () => void;
};

export function SignInScreen({
  username: initialUsername = "",
  onSignIn,
  onRegister,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  async function submit() {
    const cleanEmail = username.trim();
    if (!cleanEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSignIn(cleanEmail, password);
    } catch (authError) {
      const code = (authError as { code?: string })?.code;
      setError(
        code === "auth/invalid-credential" || code === "auth/wrong-password"
          ? "Email or password is incorrect. Please try again."
          : code === "auth/user-not-found"
            ? "No account was found for that email."
            : code === "auth/too-many-requests"
              ? "Too many sign-in attempts. Please try again later."
              : authError instanceof Error
                ? authError.message
                : "We could not sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <EternitaFrame>
      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <View style={[styles.hero, isDesktop && styles.desktopHero]}>
          <Text style={[styles.brand, isDesktop && styles.desktopBrand]}>
            Eternita
          </Text>
          <Text style={styles.title}>Sign In</Text>
          {username ? (
            <Text style={styles.welcome}>Welcome, {username}!</Text>
          ) : null}
          <Text style={[styles.legalNote, isDesktop && styles.desktopLegalNote]}>
            The Letter of Wishes is a personal message, not a legal will.
            Philippine law has formal requirements for wills.
          </Text>
        </View>

        <View style={[styles.form, isDesktop && styles.desktopForm]}>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setUsername}
            placeholder="Email"
            placeholderTextColor="#FFF1DD"
            style={styles.input}
            value={username}
          />
          <View style={styles.passwordField}>
            <TextInput
              accessibilityLabel="Password"
              autoComplete="current-password"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#FFF1DD"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              value={password}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              hitSlop={8}
              onPress={() => setShowPassword((visible) => !visible)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#FFF7EA"
              />
            </Pressable>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <EternitaButton
            title={isSubmitting ? "Signing in..." : "Sign In"}
            onPress={submit}
            disabled={isSubmitting}
          />

          <Text style={styles.registerPrompt}>
            New to Eternita?{" "}
            <Text
              accessibilityRole="link"
              onPress={onRegister}
              style={styles.link}
            >
              Register
            </Text>
          </Text>

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
  hero: {
    gap: 14,
  },
  desktopHero: {
    flex: 1,
  },
  form: {
    gap: 14,
  },
  desktopForm: {
    flex: 1,
    maxWidth: 520,
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
  title: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 22,
    textAlign: "center",
  },
  welcome: {
    color: "#FFF7EA",
    fontSize: 18,
    fontStyle: "italic",
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
  legalNote: {
    color: "#D8BE9E",
    fontFamily: "EternitaScript",
    fontSize: 18,
    lineHeight: 23,
    textAlign: "center",
  },
  desktopLegalNote: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    marginTop: 16,
  },
  registerPrompt: {
    color: "#E6CFB2",
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#F4B86E",
    textDecorationLine: "underline",
  },
});
