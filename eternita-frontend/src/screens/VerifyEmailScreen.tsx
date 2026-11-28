import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  username: string;
  email: string;
  onConfirm: () => void;
};

export function VerifyEmailScreen({
  username,
  email,
  onConfirm,
}: Props) {
  const [resendMessage, setResendMessage] = useState("");
  const { height, width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isCompact = !isDesktop && height < 760;

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
          <View style={[styles.mailIcon, isCompact && styles.compactMailIcon]}>
            <Feather
              name="mail"
              size={isCompact ? 28 : 36}
              color="#E29A48"
            />
          </View>
          <Text style={[styles.title, isCompact && styles.compactTitle]}>
            Confirm Your Email
          </Text>
          <Text style={[styles.sentMessage, isCompact && styles.compactSentMessage]}>
            We sent a confirmation link to{"\n"}
            <Text style={styles.email}>{email || "your email address"}</Text>
          </Text>
          <Text style={[styles.description, isCompact && styles.compactDescription]}>
            Open the email and tap the link. Demo: no real email is sent, so use
            the preview below.
          </Text>
        </View>

        <View
          style={[
            styles.actions,
            isDesktop && styles.desktopActions,
            isCompact && styles.compactActions,
          ]}
        >
          <View style={[styles.inbox, isCompact && styles.compactInbox]}>
            <Text style={[styles.inboxTitle, isCompact && styles.compactInboxText]}>
              DEMO INBOX
            </Text>
            <Text style={[styles.inboxText, isCompact && styles.compactInboxText]}>
              From: Eternita &lt;eternita@example.app&gt;
            </Text>
            <Text style={[styles.inboxText, isCompact && styles.compactInboxText]}>
              Subject: Confirm your Eternita account
            </Text>
            <Text style={[styles.inboxBody, isCompact && styles.compactInboxBody]}>
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
  compactContent: {
    gap: 8,
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
  compactHero: {
    gap: 8,
  },
  desktopHero: {
    flex: 1,
  },
  actions: {
    gap: 16,
  },
  compactActions: {
    gap: 8,
  },
  desktopActions: {
    flex: 1,
    maxWidth: 560,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 54,
    textAlign: "center",
  },
  compactBrand: {
    fontSize: 44,
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
  compactTitle: {
    fontSize: 18,
  },
  sentMessage: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    textAlign: "center",
  },
  compactSentMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  email: {
    color: "#F4B86E",
  },
  mailIcon: {
    alignItems: "center",
    marginTop: 4,
  },
  compactMailIcon: {
    marginTop: 0,
  },
  description: {
    color: "#FFF1DD",
    fontFamily: "Georgia",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  compactDescription: {
    fontSize: 13,
    lineHeight: 17,
  },
  inbox: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#874A13",
  },
  compactInbox: {
    gap: 6,
    padding: 12,
  },
  inboxTitle: {
    color: "#62E6DF",
    fontFamily: "Georgia",
    fontSize: 13,
  },
  compactInboxText: {
    fontSize: 11,
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
  compactInboxBody: {
    fontSize: 12,
    lineHeight: 16,
    marginVertical: 2,
  },
  resendMessage: {
    color: "#D8BE9E",
    fontSize: 13,
    textAlign: "center",
  },
});
