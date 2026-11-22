import { useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  username: string;
  email: string;
  onConfirm: () => void;
  onBack: () => void;
};

export function VerifyEmailScreen({
  username,
  email,
  onConfirm,
  onBack,
}: Props) {
  const [resendMessage, setResendMessage] = useState("");
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <EternitaFrame>
      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <View style={[styles.hero, isDesktop && styles.desktopHero]}>
          <Text style={[styles.brand, isDesktop && styles.desktopBrand]}>
            Eternita
          </Text>
          <Text style={styles.title}>Confirm Your Email</Text>
          <Text style={styles.sentMessage}>
            We sent a confirmation link to{"\n"}
            <Text style={styles.email}>{email || "your email address"}</Text>
          </Text>
          <Text style={styles.description}>
            Open the email and tap the link. Demo: no real email is sent, so use
            the preview below.
          </Text>
        </View>

        <View style={[styles.actions, isDesktop && styles.desktopActions]}>
          <View style={styles.inbox}>
            <Text style={styles.inboxTitle}>DEMO INBOX</Text>
            <Text style={styles.inboxText}>
              From: Eternita &lt;eternita@example.app&gt;
            </Text>
            <Text style={styles.inboxText}>
              Subject: Confirm your Eternita account
            </Text>
            <Text style={styles.inboxBody}>
              Hi {username || "there"}, tap the button below to confirm your
              email address. The link expires in 1 hour.
            </Text>
            <EternitaButton title="Confirm my email" onPress={onConfirm} />
          </View>

          <EternitaButton
            title="Resend link"
            onPress={() =>
              setResendMessage("Demo only: no email is sent or resent.")
            }
            variant="secondary"
          />
          {resendMessage ? (
            <Text accessibilityRole="alert" style={styles.resendMessage}>
              {resendMessage}
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
    gap: 16,
  },
  desktopContent: {
    maxWidth: 1120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 72,
  },
  hero: {
    gap: 16,
  },
  desktopHero: {
    flex: 1,
  },
  actions: {
    gap: 16,
  },
  desktopActions: {
    flex: 1,
    maxWidth: 560,
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
  sentMessage: {
    color: "#FFF7EA",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    textAlign: "center",
  },
  email: {
    color: "#F4B86E",
  },
  description: {
    color: "#FFF1DD",
    fontFamily: "Georgia",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  inbox: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#874A13",
  },
  inboxTitle: {
    color: "#62E6DF",
    fontFamily: "Georgia",
    fontSize: 13,
  },
  inboxText: {
    color: "#FFF1DD",
    fontFamily: "Georgia",
    fontSize: 13,
  },
  inboxBody: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 15,
    lineHeight: 20,
    marginVertical: 6,
  },
  resendMessage: {
    color: "#D8BE9E",
    fontSize: 13,
    textAlign: "center",
  },
});
