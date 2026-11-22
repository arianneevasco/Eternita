import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

type Props = {
  children: ReactNode;
};

export function EternitaFrame({ children }: Props) {
  const { height, width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.desktopScrollContent,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.outerFrame,
            isDesktop
              ? { minHeight: Math.max(height - 48, 640) }
              : styles.mobileOuterFrame,
          ]}
        >
          <View
            style={[
              styles.innerFrame,
              !isDesktop && styles.mobileInnerFrame,
            ]}
          >
            {children}
          </View>
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
  desktopScrollContent: {
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  outerFrame: {
    width: "100%",
    maxWidth: 1360,
    flexGrow: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: "#92551F",
    backgroundColor: "#46290F",
  },
  innerFrame: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 40,
    borderWidth: 2,
    borderColor: "#C17C38",
  },
  mobileOuterFrame: {
    maxWidth: 480,
    minHeight: 680,
    flexGrow: 0,
    padding: 8,
  },
  mobileInnerFrame: {
    minHeight: 660,
    padding: 22,
  },
});
