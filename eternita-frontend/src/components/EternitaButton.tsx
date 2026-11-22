import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
};

export function EternitaButton({
  title,
  onPress,
  variant = "primary",
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, isPrimary && styles.primaryLabel]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderRadius: 24,
    paddingHorizontal: 18,
  },
  primary: {
    borderColor: "#A65D19",
    backgroundColor: "#B96B1D",
  },
  secondary: {
    borderColor: "#C17C38",
    backgroundColor: "transparent",
  },
  label: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 18,
    textAlign: "center",
  },
  primaryLabel: {
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.78,
  },
});
