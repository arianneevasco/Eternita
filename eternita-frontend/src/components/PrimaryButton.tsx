import { Pressable, StyleSheet, Text } from "react-native";

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled) && styles.muted,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 56,
    marginTop: 20,
    backgroundColor: "#C27B22",
    borderColor: "#70410F",
    borderWidth: 3,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  muted: { opacity: 0.72 },
  label: {
    color: "#FFF8EA",
    fontFamily: "Georgia",
    fontSize: 23,
    fontWeight: "bold",
  },
});
