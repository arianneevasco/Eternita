import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onSignOut: () => void;
};

export function OwnerHomeScreen({ onSignOut }: Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.brand}>Eternita</Text>
        <Text style={styles.title}>Owner Home</Text>
        <Text style={styles.description}>
          The owner home page is ready for future screens.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onSignOut}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Back to Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#4E2B13",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
    padding: 32,
    borderRadius: 18,
    backgroundColor: "#603717",
    borderColor: "#B9783E",
    borderWidth: 1,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 42,
  },
  title: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 26,
    marginTop: 18,
  },
  description: {
    color: "#E8D4BD",
    fontSize: 15,
    marginTop: 10,
    textAlign: "center",
  },
  button: {
    minHeight: 48,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#B9783E",
    marginTop: 28,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: "#FFF7EA",
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
