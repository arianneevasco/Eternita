import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onPreviewOwner: () => void;
  onPreviewAsker: () => void;
};

export function SignInScreen({ onPreviewOwner, onPreviewAsker }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function signInPlaceholder() {
    Alert.alert(
      "Sign in is not connected yet",
      "This page is a frontend scaffold. Use either preview button to check navigation."
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brand}>Eternita</Text>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.description}>
            Your personal diary, kept private.
          </Text>

          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#B99A7B"
            style={styles.input}
            value={email}
          />
          <TextInput
            accessibilityLabel="Password"
            autoComplete="password"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#B99A7B"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable
            accessibilityRole="button"
            onPress={signInPlaceholder}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </Pressable>

          <Text style={styles.previewLabel}>Preview a home area</Text>
          <View style={styles.previewButtons}>
            <Pressable
              accessibilityRole="button"
              onPress={onPreviewOwner}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Owner</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onPreviewAsker}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Asker</Text>
            </Pressable>
          </View>
          <Text style={styles.note}>
            Authentication and account creation will be added in a later step.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#4E2B13",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    padding: 28,
    borderRadius: 18,
    backgroundColor: "#603717",
    borderColor: "#B9783E",
    borderWidth: 1,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 44,
    textAlign: "center",
  },
  title: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 28,
    marginTop: 16,
    textAlign: "center",
  },
  description: {
    color: "#E8D4BD",
    fontSize: 15,
    marginTop: 8,
    marginBottom: 28,
    textAlign: "center",
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderColor: "#B9783E",
    borderWidth: 1,
    color: "#FFF7EA",
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  primaryButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#B9783E",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFF7EA",
    fontSize: 17,
    fontWeight: "600",
  },
  previewLabel: {
    color: "#E8D4BD",
    fontSize: 14,
    marginTop: 26,
    marginBottom: 10,
    textAlign: "center",
  },
  previewButtons: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#B9783E",
    borderWidth: 1,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#FFF7EA",
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    color: "#D7BFA5",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 20,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
