import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EternitaButton } from "../components/EternitaButton";
import { EternitaFrame } from "../components/EternitaFrame";

type Props = {
  username: string;
  onContinueOwner: () => void;
  onContinueAsker: () => void;
  onBack: () => void;
};

export function FacePreviewScreen({
  username,
  onContinueOwner,
  onContinueAsker,
  onBack,
}: Props) {
  const [scanPreviewComplete, setScanPreviewComplete] = useState(false);

  return (
    <EternitaFrame>
      <View style={styles.content}>
        <Text style={styles.brand}>Eternita</Text>
        {username ? <Text style={styles.welcome}>Welcome, {username}!</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start face scan preview"
          onPress={() => setScanPreviewComplete(true)}
          style={({ pressed }) => [
            styles.facePlaceholder,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.faceInner} />
        </Pressable>
        <Text style={styles.prompt}>
          {scanPreviewComplete ? "Face scan preview complete" : "Tap the face to begin"}
        </Text>
        <View style={styles.scanMarks}>
          {[0, 1, 2, 3].map((mark) => (
            <View
              key={mark}
              style={[
                styles.scanMark,
                scanPreviewComplete && styles.scanMarkComplete,
              ]}
            />
          ))}
        </View>
        <View style={styles.diaryTitle}>
          <Text style={styles.diaryTitleText}>My Personal{"\n"}AI Diary</Text>
        </View>
        <Text style={styles.demoNote}>
          UI preview only. No camera or face data is used.
        </Text>

        {scanPreviewComplete ? (
          <View style={styles.actions}>
            <EternitaButton title="Continue to Owner" onPress={onContinueOwner} />
            <EternitaButton
              title="Continue to Asker"
              onPress={onContinueAsker}
              variant="secondary"
            />
          </View>
        ) : null}
        <EternitaButton title="Back to Sign In" onPress={onBack} variant="secondary" />
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
  brand: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 58,
    textAlign: "center",
  },
  welcome: {
    color: "#FFF7EA",
    fontSize: 16,
    fontStyle: "italic",
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
  scanMarks: {
    flexDirection: "row",
    gap: 8,
  },
  scanMark: {
    width: 26,
    height: 5,
    borderRadius: 4,
    backgroundColor: "#E8D4BD",
  },
  scanMarkComplete: {
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
  diaryTitleText: {
    color: "#FFF7EA",
    fontFamily: "Georgia",
    fontSize: 36,
    textAlign: "center",
  },
  demoNote: {
    color: "#D8BE9E",
    fontSize: 12,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 10,
  },
});
