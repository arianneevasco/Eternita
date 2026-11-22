import { StyleSheet, Text, View } from "react-native";
import { EternitaButton } from "../../components/EternitaButton";
import { EternitaFrame } from "../../components/EternitaFrame";

type Props = {
  onSignOut: () => void;
  onNavigateToAsker: () => void;
};

export function OwnerHomeScreen({ onSignOut, onNavigateToAsker }: Props) {
  return (
    <EternitaFrame>
      <View style={styles.content}>
        <Text style={styles.brand}>Eternita</Text>
        <Text style={styles.title}>Owner Home</Text>
        <Text style={styles.description}>
          The owner home page is ready for future screens.
        </Text>
        <View style={styles.navigation}>
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
});
