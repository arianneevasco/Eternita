import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

type Props = {
  onSignOut: () => void;
  onNavigateToOwner: () => void;
};

type Tab = "Diary" | "Write" | "Ask" | "Star" | "Legacy" | "Vault";

const TABS: { key: Tab; glyph: string }[] = [
  { key: "Diary", glyph: "▭" },
  { key: "Write", glyph: "✎" },
  { key: "Ask", glyph: "✦" },
  { key: "Star", glyph: "✺" },
  { key: "Legacy", glyph: "⌛" },
  { key: "Vault", glyph: "⛓" },
];

const COLORS = {
  background: "#F4A455",
  card: "#FFCA8E",
  dock: "#E09A54",
  ink: "#3B1E08",
  muted: "#6B4728",
  accent: "#8C5219",
  border: "#7B4A1A",
  light: "#FFF7EA",
};

export function AskerHomeScreen({ onSignOut, onNavigateToOwner }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [activeTab, setActiveTab] = useState<Tab>("Ask");
  const [question, setQuestion] = useState("");

  return (
    <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBar}>
            <View style={styles.brandGroup}>
              <Text style={styles.bookGlyph}>📖</Text>
              <Text style={styles.brand}>Eternita</Text>
            </View>

            <View style={styles.headerControls}>
              <View style={styles.roleSwitch}>
                <Pressable
                  onPress={onNavigateToOwner}
                  style={styles.roleSegment}
                  accessibilityRole="button"
                >
                  <Text style={styles.roleText}>OWNER</Text>
                </Pressable>
                <View style={[styles.roleSegment, styles.roleActive]}>
                  <Text style={[styles.roleText, styles.roleTextActive]}>
                    ASKER
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={onNavigateToOwner}
                style={styles.iconCircle}
                accessibilityLabel="Switch to owner area"
                accessibilityRole="button"
              >
                <Text style={styles.iconGlyph}>⇄</Text>
              </Pressable>
              <Pressable
                onPress={onSignOut}
                style={styles.iconCircle}
                accessibilityLabel="Sign out"
                accessibilityRole="button"
              >
                <Text style={styles.iconGlyph}>⏻</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>Ask Eternita</Text>
            <Text style={styles.subtitle}>
              A thoughtful way to ask about shared memories.
            </Text>
          </View>

          <View
            style={[
              styles.accessCard,
              isDesktop && styles.desktopAccessCard,
            ]}
          >
            <View style={styles.accessHeading}>
              <Text style={styles.lockGlyph}>⌑</Text>
              <Text style={styles.accessTitle}>Access is locked</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>PRIVATE</Text>
              </View>
            </View>
            <Text style={styles.accessCopy}>
              The owner decides what can be shared. Access is available only
              when the owner’s rules allow it and legacy access is active.
            </Text>
          </View>

          <View style={styles.askSection}>
            <Text style={styles.sectionTitle}>Ask about a memory</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Write your question here..."
              placeholderTextColor={COLORS.muted}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Your question"
              style={[
                styles.questionInput,
                isDesktop && styles.desktopQuestionInput,
              ]}
            />
            <Pressable
              disabled
              style={({ pressed }) => [
                styles.askButton,
                isDesktop && styles.desktopAskButton,
                (!question.trim() || pressed) && styles.askButtonMuted,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              accessibilityLabel="Ask a question, unavailable in this preview"
            >
              <Text style={styles.askButtonText}>Ask a question</Text>
              <Text style={styles.askButtonGlyph}>➤</Text>
            </Pressable>
            <Text style={styles.previewNote}>
              Preview only — questions are not sent to an AI or connected to a
              diary.
            </Text>
          </View>

          <View
            style={[
              styles.emptyState,
              isDesktop && styles.desktopEmptyState,
            ]}
          >
            <Text
              style={[
                styles.emptyGlyph,
                isDesktop && styles.desktopEmptyGlyph,
              ]}
            >
              ✦
            </Text>
            <Text
              style={[
                styles.emptyTitle,
                isDesktop && styles.desktopEmptyTitle,
              ]}
            >
              Your conversation will begin here
            </Text>
            <Text
              style={[
                styles.emptyCopy,
                isDesktop && styles.desktopEmptyCopy,
              ]}
            >
              No diary entries are available in this preview. Eternita never
              shares private memories by default.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomDock}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabItem}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[styles.tabGlyph, isActive && styles.tabActiveColor]}
                >
                  {tab.glyph}
                </Text>
                <Text
                  style={[styles.tabLabel, isActive && styles.tabActiveColor]}
                >
                  {tab.key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 96,
    gap: 14,
  },
  desktopScrollContent: {
    paddingTop: 8,
    paddingBottom: 76,
    gap: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookGlyph: {
    fontSize: 22,
    color: COLORS.ink,
  },
  brand: {
    fontFamily: "EternitaDisplay",
    fontSize: 26,
    color: COLORS.ink,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roleSwitch: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 6,
    overflow: "hidden",
  },
  roleSegment: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleActive: {
    backgroundColor: COLORS.accent,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: 0.4,
  },
  roleTextActive: {
    color: COLORS.light,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  iconGlyph: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  titleBlock: {
    gap: 3,
    marginTop: 2,
  },
  pageTitle: {
    fontFamily: "EternitaDisplay",
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: "Georgia",
    fontStyle: "italic",
    fontSize: 13,
    color: COLORS.ink,
  },
  accessCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  desktopAccessCard: {
    padding: 12,
    gap: 6,
  },
  accessHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  lockGlyph: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.accent,
  },
  accessTitle: {
    flex: 1,
    fontFamily: "EternitaDisplay",
    fontSize: 18,
    color: COLORS.ink,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: COLORS.accent,
  },
  accessCopy: {
    fontFamily: "Georgia",
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.ink,
  },
  askSection: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "EternitaDisplay",
    fontSize: 21,
    color: COLORS.ink,
  },
  questionInput: {
    minHeight: 94,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: "#D49B65",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Georgia",
    fontSize: 14,
    color: COLORS.ink,
  },
  desktopQuestionInput: {
    minHeight: 68,
  },
  askButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  desktopAskButton: {
    minHeight: 38,
  },
  askButtonMuted: {
    opacity: 0.75,
  },
  askButtonText: {
    fontFamily: "EternitaDisplay",
    fontSize: 16,
    color: COLORS.light,
  },
  askButtonGlyph: {
    fontSize: 14,
    color: COLORS.light,
  },
  previewNote: {
    fontFamily: "Georgia",
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8A868",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    minHeight: 130,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  desktopEmptyState: {
    minHeight: 62,
    paddingVertical: 6,
    gap: 2,
  },
  desktopEmptyGlyph: {
    fontSize: 16,
  },
  desktopEmptyTitle: {
    fontSize: 15,
  },
  desktopEmptyCopy: {
    fontSize: 11,
    lineHeight: 14,
    maxWidth: 440,
  },
  emptyGlyph: {
    fontSize: 20,
    color: COLORS.accent,
  },
  emptyTitle: {
    fontFamily: "EternitaDisplay",
    fontSize: 17,
    color: COLORS.ink,
    textAlign: "center",
  },
  emptyCopy: {
    maxWidth: 420,
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.ink,
    textAlign: "center",
  },
  bottomDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.dock,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 46,
  },
  tabGlyph: {
    fontSize: 18,
    color: COLORS.ink,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.ink,
  },
  tabActiveColor: {
    color: COLORS.accent,
  },
});
