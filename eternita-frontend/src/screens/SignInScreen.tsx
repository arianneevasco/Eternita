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
  onSignIn: (username: string) => void;
  onRegister: () => void;
  onPreviewOwner: () => void;
  onPreviewAsker: () => void;
};

export function SignInScreen({
  username: initialUsername = "",
  onSignIn,
  onRegister,
  onPreviewOwner,
  onPreviewAsker,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  function submit() {
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setError("");
    onSignIn(cleanUsername);
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
            accessibilityLabel="Username"
            autoCapitalize="words"
            onChangeText={setUsername}
            placeholder="Username"
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
              onPress={() => setShowPassword((visible) => !visible)}
            >
              <Text style={styles.showLabel}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <EternitaButton title="Sign In" onPress={submit} />
          <Text style={styles.demoNote}>
            Frontend preview only. Credentials and face sign-in are not checked.
          </Text>

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

          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Preview a home area</Text>
            <View style={styles.previewButtons}>
              <View style={styles.previewButton}>
                <EternitaButton
                  title="Owner"
                  onPress={onPreviewOwner}
                  variant="secondary"
                />
              </View>
              <View style={styles.previewButton}>
                <EternitaButton
                  title="Asker"
                  onPress={onPreviewAsker}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
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
    fontFamily: "Georgia",
    fontSize: 54,
    textAlign: "center",
  },
  desktopBrand: {
    fontSize: 80,
    textAlign: "left",
  },
  title: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
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
  showLabel: {
    color: "#FFF7EA",
    fontSize: 13,
    fontWeight: "600",
    paddingLeft: 8,
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
    fontFamily: "Georgia",
    fontSize: 13,
    lineHeight: 18,
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
  preview: {
    gap: 10,
    marginTop: 4,
  },
  previewTitle: {
    color: "#E6CFB2",
    fontSize: 13,
    textAlign: "center",
  },
  previewButtons: {
    flexDirection: "row",
    gap: 10,
  },
  previewButton: {
    flex: 1,
  },
});
