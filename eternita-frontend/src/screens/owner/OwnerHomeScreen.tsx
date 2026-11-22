import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { EternitaButton } from "../../components/EternitaButton";
import { EternitaFrame } from "../../components/EternitaFrame";

type Props = {
  onSignOut: () => void;
  onNavigateToAsker: () => void;
};

export function OwnerHomeScreen({ onSignOut, onNavigateToAsker }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <EternitaFrame>
      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        <Text style={styles.brand}>Eternita</Text>
        <Text style={styles.title}>Owner Home</Text>
        <Text style={styles.description}>
          The owner home page is ready for future screens.
        </Text>
        <View style={[styles.navigation, isDesktop && styles.desktopNavigation]}>
          <EternitaButton
            title="Asker Area"
            onPress={onNavigateToAsker}
            variant="secondary"
          />
        </View>
        <EternitaButton title="Back to Sign In" onPress={onSignOut} />
      </View>
    </EternitaFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  desktopContent: {
    maxWidth: 820,
    alignSelf: "center",
    paddingVertical: 36,
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
    fontSize: 25,
    textAlign: "center",
  },
  description: {
    color: "#E8D4BD",
    fontFamily: "Georgia",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  navigation: {
    width: "100%",
  },
  desktopNavigation: {
    maxWidth: 440,
  },
});
