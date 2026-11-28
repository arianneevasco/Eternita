import { useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  onContinueOwner: () => void;
  onContinueAsker: () => void;
  onBack: () => void;
};

export function FacePreviewScreen({
  onContinueOwner,
  onContinueAsker,
  onBack,
}: Props) {
  const [scanPreviewComplete, setScanPreviewComplete] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const [scanProgress] = useState(() => new Animated.Value(0));
  const { height, width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isCompact = !isDesktop && height < 760;

  function startScanPreview() {
    if (scanStarted) {
      return;
    }

    setScanStarted(true);
    Animated.timing(scanProgress, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setScanPreviewComplete(true);
      }
    });
  }

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
          <View
            style={[
              styles.diaryTitle,
              isCompact && styles.compactDiaryTitle,
            ]}
          >
            <Text
              style={[
                styles.diaryTitleText,
                isDesktop && styles.desktopDiaryTitle,
                isCompact && styles.compactDiaryTitleText,
              ]}
            >
              My Personal{"\n"}AI Diary
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.scanPanel,
            isDesktop && styles.desktopScanPanel,
            isCompact && styles.compactScanPanel,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start face scan preview"
            disabled={scanStarted}
            onPress={startScanPreview}
            style={({ pressed }) => [
              styles.facePlaceholder,
              isDesktop && styles.desktopFacePlaceholder,
              isCompact && styles.compactFacePlaceholder,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.faceInner} />
          </Pressable>
          <Text style={[styles.prompt, isCompact && styles.compactPrompt]}>
            {scanPreviewComplete
              ? "Face scan preview complete"
              : "Tap the face to begin"}
          </Text>
          <View style={styles.scanMarks}>
            {[0, 1, 2, 3].map((mark) => (
              <View
                key={mark}
                style={styles.scanMark}
              >
                <Animated.View
                  style={[
                    styles.scanMarkFill,
                    {
                      width: scanProgress.interpolate({
                        inputRange: [mark / 4, (mark + 1) / 4],
                        outputRange: ["0%", "100%"],
                        extrapolate: "clamp",
                      }),
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <Text style={[styles.demoNote, isCompact && styles.compactDemoNote]}>
            UI preview only. No camera or face data is used.
          </Text>

          {scanPreviewComplete ? (
            <View style={styles.actions}>
              <EternitaButton
                title="Continue to Owner"
                onPress={onContinueOwner}
              />
              <EternitaButton
                title="Continue to Asker"
                onPress={onContinueAsker}
                variant="secondary"
              />
            </View>
          ) : null}
          {!scanPreviewComplete ? (
            <EternitaButton
              title="Back to Sign In"
              onPress={onBack}
              variant="secondary"
            />
          ) : null}
        </View>
      </View>
    </EternitaFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
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
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  compactHero: {
    gap: 8,
  },
  desktopHero: {
    flex: 1,
    width: "auto",
    alignItems: "flex-start",
  },
  scanPanel: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  compactScanPanel: {
    gap: 8,
  },
  desktopScanPanel: {
    flex: 1,
    maxWidth: 520,
  },
  brand: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 58,
    textAlign: "center",
  },
  compactBrand: {
    fontSize: 44,
  },
  desktopBrand: {
    fontSize: 80,
    textAlign: "left",
  },
  facePlaceholder: {
    width: 250,
    height: 300,
    maxWidth: "90%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 8,
    borderColor: "#B96B1D",
    borderRadius: 150,
    backgroundColor: "#6A687F",
  },
  compactFacePlaceholder: {
    width: 184,
    height: 220,
    borderWidth: 6,
  },
  desktopFacePlaceholder: {
    width: 280,
    height: 320,
  },
  faceInner: {
    width: "72%",
    height: "72%",
    borderRadius: 120,
    backgroundColor: "#6A687F",
  },
  pressed: {
    opacity: 0.8,
  },
  prompt: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 19,
    textAlign: "center",
  },
  compactPrompt: {
    fontSize: 15,
  },
  scanMarks: {
    flexDirection: "row",
    gap: 8,
  },
  scanMark: {
    width: 26,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#E8D4BD",
    overflow: "hidden",
  },
  scanMarkFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#6BE3C2",
  },
  diaryTitle: {
    width: "100%",
    alignItems: "center",
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#C17C38",
    paddingVertical: 8,
  },
  compactDiaryTitle: {
    paddingVertical: 4,
  },
  diaryTitleText: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 36,
    textAlign: "center",
  },
  compactDiaryTitleText: {
    fontSize: 25,
    lineHeight: 30,
  },
  desktopDiaryTitle: {
    fontSize: 48,
    textAlign: "left",
  },
  demoNote: {
    color: "#D8BE9E",
    fontSize: 12,
    textAlign: "center",
  },
  compactDemoNote: {
    fontSize: 10,
  },
  actions: {
    width: "100%",
    gap: 10,
  },
});
