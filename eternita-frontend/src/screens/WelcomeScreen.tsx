import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function WelcomeScreen({ onGetStarted, onSignIn }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <EternitaFrame>
      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <View style={[styles.hero, isDesktop && styles.desktopHero]}>
          <Text style={[styles.brand, isDesktop && styles.desktopBrand]}>
            Eternita
          </Text>
          <Text style={[styles.subtitle, isDesktop && styles.desktopSubtitle]}>
            My Personal Diary
          </Text>
        </View>

        <View style={[styles.details, isDesktop && styles.desktopDetails]}>
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>BEFORE YOU START</Text>
            <Text style={styles.instruction}>1. Register your account</Text>
            <Text style={styles.instruction}>2. Enroll and verify your face</Text>
            <Text style={styles.instruction}>
              3. From then on, sign in with your face
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            The Letter of Wishes is a personal message, not a legal will.
            Philippine law has formal requirements for wills.
          </Text>

          <EternitaButton title="Get Started" onPress={onGetStarted} />
          <Text style={styles.signInPrompt}>
            Already have an account?{" "}
            <Text accessibilityRole="link" onPress={onSignIn} style={styles.link}>
              Sign in
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
    gap: 18,
  },
  desktopContent: {
    maxWidth: 1120,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 72,
  },
  hero: {
    gap: 8,
  },
  desktopHero: {
    flex: 1,
  },
  details: {
    gap: 18,
  },
  desktopDetails: {
    flex: 1,
    maxWidth: 560,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 58,
    textAlign: "center",
  },
  desktopBrand: {
    fontSize: 88,
    textAlign: "left",
  },
  subtitle: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 20,
    textAlign: "center",
  },
  desktopSubtitle: {
    fontSize: 26,
    textAlign: "left",
  },
  instructions: {
    gap: 5,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#874A13",
  },
  instructionsTitle: {
    color: "#FFF2DD",
    fontFamily: "Georgia",
    fontSize: 14,
    marginBottom: 8,
  },
  instruction: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 17,
    lineHeight: 23,
  },
  disclaimer: {
    color: "#E6CFB2",
    fontFamily: "EternitaScript",
    fontSize: 18,
    lineHeight: 23,
    paddingHorizontal: 6,
  },
  signInPrompt: {
    color: "#E6CFB2",
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#F4B86E",
    textDecorationLine: "underline",
  },
});
