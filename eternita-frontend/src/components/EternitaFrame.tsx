import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

type Props = {
  children: ReactNode;
};

export function EternitaFrame({ children }: Props) {
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>{children}</View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#080604",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  outerFrame: {
    width: "100%",
    maxWidth: 480,
    minHeight: 680,
    padding: 8,
    borderWidth: 2,
    borderColor: "#92551F",
    backgroundColor: "#46290F",
  },
  innerFrame: {
    flexGrow: 1,
    minHeight: 660,
    justifyContent: "center",
    padding: 22,
    borderWidth: 2,
    borderColor: "#C17C38",
  },
});
