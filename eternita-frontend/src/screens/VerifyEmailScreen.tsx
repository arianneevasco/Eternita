import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";

type Props = {
  email: string;
  warning?: string;
  onConfirm: () => Promise<void>;
  onResend: () => Promise<void>;
  onBackToSignIn: () => void;
};

export function VerifyEmailScreen({
  email,
  warning,
  onConfirm,
  onResend,
  onBackToSignIn,
}: Props) {
  const [message, setMessage] = useState(warning ?? "");
  const [busy, setBusy] = useState(false);

  async function run(
    action: () => Promise<void>,
    pendingText: string,
    successText: string
  ) {
    setBusy(true);
    setMessage(pendingText);
    try {
      await action();
      setMessage(successText);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The request failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.book}>
        <View style={styles.innerBorder}>
          <Text style={styles.brand}>Eternita</Text>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.body}>
            Open the email sent to {email} and tap the verification link. Then
            return here to continue.
          </Text>

          <View style={styles.inbox}>
            <Text style={styles.demoLabel}>ETERNITA ACCOUNT</Text>
            <Text style={styles.emailMeta}>To: {email}</Text>
            <Text style={styles.emailBody}>
              Verify your email address to finish setting up your Eternita
              account.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                void run(
                  onConfirm,
                  "Checking email verification...",
                  "Email verified. Opening your home page..."
                )
              }
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>Confirm my email</Text>
            </Pressable>
          </View>

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <PrimaryButton
            title={busy ? "Please wait..." : "Resend link"}
            disabled={busy}
            onPress={() =>
              void run(
                onResend,
                "Sending a new verification link...",
                "Verification email sent. Check your inbox."
              )
            }
          />
          <Pressable onPress={onBackToSignIn} accessibilityRole="button">
            <Text style={styles.link}>Back to sign in</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
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
    padding: 24,
  },
  brand: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 54,
  },
  title: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 27,
    marginTop: 12,
    marginBottom: 14,
    textAlign: "center",
  },
  body: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    marginBottom: 18,
  },
  inbox: {
    width: "100%",
    backgroundColor: "#895018",
    borderRadius: 17,
    padding: 18,
  },
  demoLabel: {
    color: "#66E4EC",
    fontFamily: "Georgia",
    fontSize: 14,
    marginBottom: 12,
  },
  emailMeta: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 14,
  },
  emailBody: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 16,
    lineHeight: 22,
    marginVertical: 16,
  },
  confirmButton: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#5A2F10",
    backgroundColor: "#B9783E",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 20,
  },
  message: {
    color: "#FFE1BD",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 14,
  },
  link: {
    color: "#F4D6AE",
    fontSize: 15,
    marginTop: 20,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
