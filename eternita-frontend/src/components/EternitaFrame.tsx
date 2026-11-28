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
  const frameHeight = Math.max(
    height - (isDesktop ? 76 : 60),
    480
  );

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
            { height: frameHeight, flexGrow: 0 },
            isDesktop
              ? null
              : styles.mobileOuterFrame,
          ]}
        >
          <View
            style={[
              styles.innerFrame,
              !isDesktop && styles.mobileInnerFrame,
            ]}
          >
            <View style={styles.contentViewport}>{children}</View>
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
    paddingVertical: 16,
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
    borderColor: "#A95F1C",
    backgroundColor: "#48280E",
  },
  innerFrame: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    padding: 40,
    borderWidth: 2,
    borderColor: "#D18232",
  },
  contentViewport: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    justifyContent: "center",
    overflow: "hidden",
  },
  mobileOuterFrame: {
    maxWidth: 480,
    padding: 8,
  },
  mobileInnerFrame: {
    padding: 22,
  },
});
