import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ApiError } from "../../api/client";
import {
  createEntry,
  listEntries,
  publishEntry,
  type CreateEntryInput,
  type DiaryEntry,
  type WritingMode,
} from "../../features/diary/api";
import { OwnerAuxiliaryScreen } from "./OwnerAuxiliaryScreens";

type CategoryFilter =
  | "All"
  | "Personal"
  | "Health"
  | "Family"
  | "Travel"
  | "Favorite";
type EntrySource = "VOICE" | "TEXT";
type BottomTab = "Diary" | "Write" | "Ask" | "Star" | "Legacy" | "Vault";
type JournalCategory = Exclude<CategoryFilter, "All" | "Favorite">;
type Feeling = "Soft care" | "Happiness" | "Pride" | "Peace";
type WritingModeOption = "Real Life" | "Stay as it is" | "Review";

export type DiaryEntryItem = {
  id: string;
  date: string;
  time?: string;
  category: string;
  source: EntrySource;
  excerpt: string;
  aiTone: "sparkle" | "moon";
  tags?: string[];
  starred?: boolean;
  isDraft?: boolean;
};

type Props = {
  onSignOut: () => void;
  onNavigateToAsker: () => void;
  idToken?: string;
  entries?: DiaryEntryItem[];
  onOpenEntry?: (entry: DiaryEntryItem) => void;
  onSelectTab?: (tab: BottomTab) => void;
  previewMode?: boolean;
  onOpenRegister?: () => void;
};

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Personal",
  "Health",
  "Family",
  "Travel",
  "Favorite",
];
const JOURNALS: JournalCategory[] = [
  "Personal",
  "Health",
  "Family",
  "Travel",
];
const FEELINGS: { label: Feeling; glyph: string; mood: number }[] = [
  { label: "Soft care", glyph: "✦", mood: 1 },
  { label: "Happiness", glyph: "☼", mood: 4 },
  { label: "Pride", glyph: "❂", mood: 5 },
  { label: "Peace", glyph: "☾", mood: 3 },
];
const WRITING_MODES: {
  label: WritingModeOption;
  value: WritingMode;
  description: string;
}[] = [
  {
    label: "Real Life",
    value: "lightfix",
    description: "Writing help is a preview; your original stays unchanged.",
  },
  {
    label: "Stay as it is",
    value: "verbatim",
    description: "Saved exactly as you wrote or said it.",
  },
  {
    label: "Review",
    value: "review",
    description: "Suggestions are not generated in this preview.",
  },
];

const BOTTOM_TABS: { key: BottomTab; label: string; glyph: string }[] = [
  { key: "Diary", label: "Diary", glyph: "▭" },
  { key: "Write", label: "Write", glyph: "✎" },
  { key: "Ask", label: "Ask", glyph: "✦" },
  { key: "Star", label: "Star", glyph: "✺" },
  { key: "Legacy", label: "Legacy", glyph: "⌛" },
  { key: "Vault", label: "Vault", glyph: "⛓" },
];

export function OwnerHomeScreen({
  onSignOut,
  onNavigateToAsker,
  idToken,
  entries: externalEntries,
  onOpenEntry,
  onSelectTab,
  previewMode = false,
  onOpenRegister,
}: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isCompact = width < 560;

  const [entries, setEntries] = useState<DiaryEntryItem[]>(externalEntries ?? []);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");
  const [activeTab, setActiveTab] = useState<BottomTab>("Diary");
  const [selectedJournal, setSelectedJournal] =
    useState<JournalCategory>("Personal");
  const [selectedFeeling, setSelectedFeeling] =
    useState<Feeling>("Soft care");
  const [selectedMode, setSelectedMode] =
    useState<WritingModeOption>("Stay as it is");
  const [entryDate, setEntryDate] = useState(() => getLocalDate());
  const [entryText, setEntryText] = useState("");
  const [entryTags, setEntryTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loadedToken, setLoadedToken] = useState<string>();
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntryItem>();
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false);
  const requestToken = idToken;
  const isLoading = Boolean(
    requestToken && !externalEntries && loadedToken !== requestToken
  );

  const activeData = previewMode ? entries : externalEntries ?? entries;

  const filteredEntries = useMemo(() => {
    const filtered =
      selectedCategory === "All"
        ? activeData
        : selectedCategory === "Favorite"
          ? activeData.filter((item) => item.starred)
          : activeData.filter((item) => item.category === selectedCategory);
    return [...filtered]
      .sort((a, b) =>
      `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`)
      );
  }, [activeData, selectedCategory]);

  useEffect(() => {
    if (!requestToken || externalEntries) return;

    let isCurrent = true;

    listEntries(requestToken)
      .then((savedEntries) => {
        if (isCurrent) {
          setEntries(savedEntries.map(mapBackendEntry));
          setErrorMessage("");
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) setErrorMessage(getEntryErrorMessage(error, "load"));
      })
      .finally(() => {
        if (isCurrent) setLoadedToken(requestToken);
      });

    return () => {
      isCurrent = false;
    };
  }, [externalEntries, requestToken]);

  const handleSaveEntry = async () => {
    const trimmedText = entryText.trim();
    if (!trimmedText) {
      setErrorMessage("Write something in your entry before saving.");
      return;
    }
    if (!isValidEntryDate(entryDate)) {
      setErrorMessage("Enter a valid date in YYYY-MM-DD format.");
      return;
    }
    if (externalEntries && !previewMode) {
      setErrorMessage("Entries cannot be saved from this read-only preview.");
      return;
    }
    if (!requestToken && !previewMode) {
      setErrorMessage("Sign in to your owner account before saving entries.");
      return;
    }

    const feeling = FEELINGS.find((item) => item.label === selectedFeeling);
    const mode = WRITING_MODES.find((item) => item.label === selectedMode);
    if (!feeling || !mode) {
      setErrorMessage("Choose a feeling and writing mode before saving.");
      return;
    }
    const input: CreateEntryInput = {
      title: trimmedText.split(/\r?\n/, 1)[0].slice(0, 200) || "Diary entry",
      originalText: trimmedText,
      journal: selectedJournal,
      entryDate,
      entryTime: getLocalTime(),
      mood: feeling.mood,
      tags: normalizeEntryTags(entryTags),
      writingMode: mode.value,
      isDraft: true,
    };

    setIsSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    if (previewMode) {
      const localEntry: DiaryEntryItem = {
        id: `preview-${Date.now()}`,
        date: entryDate,
        time: getLocalTime(),
        category: selectedJournal,
        source: "TEXT",
        excerpt: trimmedText,
        aiTone: selectedFeeling === "Peace" ? "moon" : "sparkle",
        tags: normalizeEntryTags(entryTags),
        isDraft: true,
      };
      setEntries((currentEntries) => [...currentEntries, localEntry]);
      setEntryText("");
      setEntryTags("");
      setEntryDate(getLocalDate());
      setSelectedCategory("All");
      setActiveTab("Diary");
      setStatusMessage("Saved in this local preview only.");
      setIsSaving(false);
      return;
    }

    try {
      const savedEntry = mapBackendEntry(await createEntry(requestToken!, input));

      setEntries((currentEntries) => [...currentEntries, savedEntry]);
      setEntryText("");
      setEntryTags("");
      setEntryDate(getLocalDate());
      setSelectedCategory("All");
      setActiveTab("Diary");
      setStatusMessage("Entry saved.");
    } catch (error) {
      setErrorMessage(getEntryErrorMessage(error, "save"));
    } finally {
      setIsSaving(false);
    }
  };

  const openEntry = (entry: DiaryEntryItem) => {
    setSelectedEntry(entry);
    onOpenEntry?.(entry);
  };

  const handlePublishEntry = async () => {
    if (previewMode && selectedEntry) {
      const published = { ...selectedEntry, isDraft: false };
      setEntries((current) => current.map((entry) => entry.id === published.id ? published : entry));
      setSelectedEntry(published);
      setStatusMessage("Published in this local preview only.");
      return;
    }
    if (!requestToken || !selectedEntry || externalEntries || !selectedEntry.isDraft) return;
    setIsUpdatingEntry(true);
    setErrorMessage("");
    try {
      await publishEntry(requestToken, selectedEntry.id);
      const published = { ...selectedEntry, isDraft: false };
      setEntries((current) => current.map((entry) => entry.id === published.id ? published : entry));
      setSelectedEntry(published);
      setStatusMessage("Entry published to the append-only store.");
    } catch (error) {
      setErrorMessage(getEntryErrorMessage(error, "publish"));
    } finally {
      setIsUpdatingEntry(false);
    }
  };

  const handleTabPress = (tab: BottomTab) => {
    setActiveTab(tab);
    onSelectTab?.(tab);
  };

  return (
    <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header */}
          <View style={styles.topBar}>
            <View style={[styles.brandGroup, isCompact && styles.compactBrandGroup]}>
              <MaterialCommunityIcons name="book-open-page-variant-outline" size={isCompact ? 21 : 27} color={COLORS.inkBrown} />
              <Text style={[styles.brand, isCompact && styles.compactBrand]}>
                Eternita
              </Text>
            </View>

            <View
              style={[
                styles.headerControls,
                isCompact && styles.compactHeaderControls,
              ]}
            >
              <View
                style={[
                  styles.roleSwitch,
                  isCompact && styles.compactRoleSwitch,
                ]}
              >
                <Pressable
                  style={[
                    styles.roleSegment,
                    isCompact && styles.compactRoleSegment,
                    styles.roleActive,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.roleText, styles.roleTextActive]}>
                    OWNER
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onNavigateToAsker}
                  style={[
                    styles.roleSegment,
                    isCompact && styles.compactRoleSegment,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.roleText}>ASKER</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={onNavigateToAsker}
                style={[
                  styles.iconCircle,
                  isCompact && styles.compactSwitchIcon,
                ]}
                accessibilityLabel="Switch mode"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="swap-horizontal" size={16} color={COLORS.inkBrown} />
              </Pressable>

              <Pressable
                onPress={onSignOut}
                style={[
                  styles.iconCircle,
                  isCompact && styles.compactIconCircle,
                ]}
                accessibilityLabel="Sign out"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="power" size={15} color={COLORS.inkBrown} />
              </Pressable>
            </View>
          </View>

          {activeTab === "Write" ? (
            <View
              style={[
                styles.writeForm,
                isDesktop && styles.desktopWriteForm,
              ]}
            >
              <View style={styles.titleBlock}>
                <Text
                  style={[
                    styles.pageTitle,
                    isDesktop && styles.desktopPageTitle,
                  ]}
                >
                  New Entry
                </Text>
                <Text
                  style={[
                    styles.dateSubtitle,
                    isDesktop && styles.desktopDateSubtitle,
                  ]}
                >
                  Your original is always preserved in your diary.
                </Text>
              </View>

              <View style={isDesktop ? styles.desktopFieldRow : undefined}>
                <View style={[styles.formSection, isDesktop && styles.flexField]}>
                  <Text
                    style={[
                      styles.formLabel,
                      isDesktop && styles.desktopFormLabel,
                    ]}
                  >
                    JOURNAL
                  </Text>
                  <View style={styles.optionRow}>
                    {JOURNALS.map((journal) => {
                      const selected = selectedJournal === journal;
                      return (
                        <Pressable
                          key={journal}
                          onPress={() => setSelectedJournal(journal)}
                          style={[
                            styles.chip,
                            styles.formChip,
                            selected && styles.chipSelected,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selected && styles.chipTextSelected,
                            ]}
                          >
                            {journal}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={[styles.formSection, styles.dateField]}>
                  <Text
                    style={[
                      styles.formLabel,
                      isDesktop && styles.desktopFormLabel,
                    ]}
                  >
                    DATE
                  </Text>
                  <TextInput
                    value={entryDate}
                    onChangeText={setEntryDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={COLORS.inkMuted}
                    maxLength={10}
                    accessibilityLabel="Entry date"
                    style={styles.dateInput}
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.formLabel,
                    isDesktop && styles.desktopFormLabel,
                  ]}
                >
                  WRITING MODE
                </Text>
                <View style={styles.modeSelector}>
                  {WRITING_MODES.map((mode) => {
                    const selected = selectedMode === mode.label;
                    return (
                      <Pressable
                        key={mode.label}
                        onPress={() => setSelectedMode(mode.label)}
                        style={[
                          styles.modeOption,
                          selected && styles.modeSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.modeText,
                            selected && styles.modeTextSelected,
                          ]}
                        >
                          {mode.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text
                  style={[
                    styles.modeDescription,
                    isDesktop && styles.desktopModeDescription,
                  ]}
                >
                  {
                    WRITING_MODES.find(
                      (mode) => mode.label === selectedMode
                    )?.description
                  }
                </Text>
              </View>

              <View style={styles.formSection}>
                <Text
                  style={[
                    styles.formLabel,
                    isDesktop && styles.desktopFormLabel,
                  ]}
                >
                  FEELINGS
                </Text>
                <View style={styles.optionRow}>
                  {FEELINGS.map((feeling) => {
                    const selected = selectedFeeling === feeling.label;
                    return (
                      <Pressable
                        key={feeling.label}
                        onPress={() => setSelectedFeeling(feeling.label)}
                        style={[
                          styles.chip,
                          styles.formChip,
                          selected && styles.chipSelected,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}
                        >
                          {feeling.glyph} {feeling.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={[styles.formLabel, isDesktop && styles.desktopFormLabel]}>
                  TAGS
                </Text>
                <TextInput
                  value={entryTags}
                  onChangeText={setEntryTags}
                  placeholder="Add tags, separated by commas"
                  placeholderTextColor={COLORS.inkMuted}
                  maxLength={300}
                  accessibilityLabel="Entry tags"
                  style={styles.dateInput}
                  autoCapitalize="none"
                />
              </View>

              <TextInput
                value={entryText}
                onChangeText={setEntryText}
                placeholder="Speak or try your entry....."
                placeholderTextColor={COLORS.inkMuted}
                multiline
                textAlignVertical="top"
                maxLength={20000}
                accessibilityLabel="Diary entry"
                style={[
                  styles.entryInput,
                  isDesktop && styles.desktopEntryInput,
                ]}
              />

              <View
                style={[
                  styles.voiceNote,
                  isDesktop && styles.desktopVoiceNote,
                ]}
              >
                <Text
                  style={[
                    styles.voiceGlyph,
                    isDesktop && styles.desktopVoiceGlyph,
                  ]}
                >
                  🎙
                </Text>
                <Text
                  style={[
                    styles.voiceCopy,
                    isDesktop && styles.desktopVoiceCopy,
                  ]}
                >
                  Speech-to-text keeps the raw transcript and a cleaned copy.
                  Voice input is not connected in this preview.
                </Text>
              </View>

              <Pressable
                onPress={handleSaveEntry}
                disabled={isSaving}
                style={({ pressed }) => [
                  styles.saveButton,
                  isDesktop && styles.desktopSaveButton,
                  pressed && !isSaving && styles.saveButtonPressed,
                  isSaving && styles.saveButtonDisabled,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: isSaving, busy: isSaving }}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? "Saving..." : "Save Entry"}
                </Text>
              </Pressable>

              {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.errorMessage}>
                  {errorMessage}
                </Text>
              ) : null}
              {statusMessage ? (
                <Text accessibilityRole="summary" style={styles.statusMessage}>
                  {statusMessage}
                </Text>
              ) : null}

              <Text
                style={[
                  styles.integrityNote,
                  isDesktop && styles.desktopIntegrityNote,
                ]}
              >
                The original is always kept. Saved entries are appended to the
                hash chain.
              </Text>
              <Text
                style={[
                  styles.legalNote,
                  isDesktop && styles.desktopLegalNote,
                ]}
              >
                ⚖ The Letter of Wishes is a personal message, not a legal will.
              </Text>
            </View>
          ) : activeTab === "Diary" ? (
            <>
              <View style={styles.titleBlock}>
                <Text style={styles.pageTitle}>My Diary</Text>
                <Text style={styles.dateSubtitle}>
                  Saturday, November 13, 2026
                </Text>
              </View>

              {statusMessage ? (
                <Text accessibilityRole="summary" style={styles.statusMessage}>
                  {statusMessage}
                </Text>
              ) : null}
              {errorMessage ? (
                <Text accessibilityRole="alert" style={styles.errorMessage}>
                  {errorMessage}
                </Text>
              ) : null}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.entriesCount}>
                {isLoading
                  ? "Loading entries..."
                  : `Entries : ${filteredEntries.length}`}
              </Text>

              {!requestToken && !externalEntries && !previewMode ? (
                <Text style={styles.statusMessage}>
                  Connect an owner sign-in session to load and save your entries.
                </Text>
              ) : null}
              {!isLoading && filteredEntries.length === 0 ? (
                <Text style={styles.emptyMessage}>
                  No entries yet. Your saved entries will appear here.
                </Text>
              ) : null}

              <View style={styles.cardsList}>
                {filteredEntries.map((item) => {
                  const cardContent = (
                    <>
                      <View style={styles.cardHeader}>
                        <View style={styles.metaRow}>
                          <Text style={styles.entryDate}>{item.date}</Text>
                          <Text style={styles.entryCategory}>
                            ({item.category.toUpperCase()})
                          </Text>
                          <View style={styles.sourceBadge}>
                            <Text style={styles.sourceBadgeText}>
                              {item.isDraft ? "DRAFT" : item.source}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.cardActions}>
                          <Text
                            style={[
                              styles.toneGlyph,
                              item.aiTone === "moon" && styles.moonGlyph,
                            ]}
                          >
                            {item.aiTone === "moon" ? "☾" : "✦"}
                          </Text>
                          {item.starred ? (
                            <Text style={[styles.starGlyph, styles.starActive]}>
                              ★
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <Text style={styles.excerpt}>{item.excerpt}</Text>
                      {item.tags?.length ? (
                        <Text style={styles.entryTags}>
                          TAGS · {item.tags.join(", ")}
                        </Text>
                      ) : null}
                    </>
                  );

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => openEntry(item)}
                      style={({ pressed }) => [
                        styles.card,
                        pressed && styles.cardPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`View entry dated ${item.date}`}
                    >
                      {cardContent}
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : (
            <OwnerAuxiliaryScreen
              screen={activeTab}
              entries={activeData}
              idToken={requestToken}
              onOpenRegister={onOpenRegister}
            />
          )}
        </ScrollView>

        <Modal
          transparent
          visible={Boolean(selectedEntry)}
          animationType="fade"
          onRequestClose={() => setSelectedEntry(undefined)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.entryModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedEntry?.date} · {selectedEntry?.category}
                </Text>
                <Pressable
                  onPress={() => setSelectedEntry(undefined)}
                  accessibilityLabel="Close entry"
                  accessibilityRole="button"
                  hitSlop={10}
                >
                  <Text style={styles.modalClose}>×</Text>
                </Pressable>
              </View>
              <ScrollView style={styles.modalTextScroll}>
                <Text style={styles.modalBody}>{selectedEntry?.excerpt}</Text>
                {selectedEntry?.tags?.length ? (
                  <Text style={styles.entryTags}>
                    TAGS · {selectedEntry.tags.join(", ")}
                  </Text>
                ) : null}
              </ScrollView>
              {selectedEntry?.isDraft ? (
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={handlePublishEntry}
                    disabled={isUpdatingEntry || (!requestToken && !previewMode) || (Boolean(externalEntries) && !previewMode)}
                    style={styles.modalButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.modalButtonText}>
                      {isUpdatingEntry ? "Publishing..." : "Publish Entry"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
              {!requestToken && !previewMode ? (
                <Text style={styles.errorMessage}>
                  Add a Firebase ID token to enable entry changes.
                </Text>
              ) : null}
            </View>
          </View>
        </Modal>

        {/* Bottom Navigation Dock */}
        <View style={styles.bottomDock}>
          {BOTTOM_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={styles.tabItem}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name={({ Diary: "book-outline", Write: "pencil-outline", Ask: "star-four-points", Star: "brightness-5", Legacy: "timer-sand", Vault: "link-variant" } as const)[tab.key]} size={21} color={isActive ? COLORS.activeBrown : "#8C5B2B"} />
                <Text
                  style={[styles.tabLabel, isActive && styles.tabActiveColor]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
  );
}

const COLORS = {
  bgWarm: "#F4A455",
  cardCream: "#FFCA8E",
  cardPressed: "#FFC078",
  dockTan: "#E09A54",
  inkBrown: "#3B1E08",
  inkMuted: "#6B4728",
  accentRust: "#C93B22",
  activeBrown: "#8C5219",
  chipTan: "#E5A563",
  chipBorder: "#7B4A1A",
  starYellow: "#FFE63B",
  starInactive: "#FFF8E7",
  sparkleBlue: "#48A9E6",
  error: "#8A2416",
  success: "#285B2D",
};

function getLocalDate(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getLocalTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
}

function normalizeEntryTags(value: string): string[] {
  return [...new Set(
    value
      .split(",")
      .map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 31)
      )
      .filter(Boolean)
  )];
}

function isValidEntryDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function mapBackendEntry(entry: DiaryEntry): DiaryEntryItem {
  return {
    id: entry.entryId ?? entry.id,
    date: entry.entryDate,
    time: entry.entryTime,
    category: entry.journal,
    source: "TEXT",
    excerpt: entry.originalText,
    aiTone: entry.mood <= 2 ? "moon" : "sparkle",
    tags: entry.tags,
    starred: entry.isFavorite,
    isDraft: entry.isDraft ?? true,
  };
}

function getEntryErrorMessage(
  error: unknown,
  action: "load" | "save" | "publish"
): string {
  if (error instanceof Error && error.message.includes("API_BASE_URL")) {
    return "Backend URL has not been configured yet. Entries cannot sync until the backend URL is provided.";
  }

  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "Please check the entry details and try again.";
    }
    if (error.status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    if (error.status === 403) {
      return "You do not have permission to access these entries.";
    }
  }

  if (action === "load") return "We could not load your entries. Please try again.";
  if (action === "publish") return "We could not publish your entry. Please try again.";
  return "We could not save your entry. Please try again.";
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    backgroundColor: COLORS.bgWarm,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 96,
    gap: 12,
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
  compactBrandGroup: {
    gap: 4,
  },
  bookGlyph: {
    fontSize: 22,
    color: COLORS.inkBrown,
  },
  compactBookGlyph: {
    fontSize: 17,
  },
  brand: {
    fontFamily: "EternitaDisplay",
    fontSize: 26,
    color: COLORS.inkBrown,
    letterSpacing: 0.2,
  },
  compactBrand: {
    fontSize: 20,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  compactHeaderControls: {
    gap: 4,
  },
  roleSwitch: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderColor: COLORS.inkBrown,
    borderRadius: 6,
    overflow: "hidden",
  },
  compactRoleSwitch: {
    borderWidth: 1,
  },
  roleSegment: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "transparent",
  },
  compactRoleSegment: {
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  roleActive: {
    backgroundColor: COLORS.activeBrown,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.inkBrown,
    letterSpacing: 0.4,
  },
  roleTextActive: {
    color: "#FFF7EA",
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.inkBrown,
    alignItems: "center",
    justifyContent: "center",
  },
  compactIconCircle: {
    width: 23,
    height: 23,
    borderRadius: 12,
  },
  compactSwitchIcon: {
    display: "none",
  },
  iconGlyph: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.inkBrown,
  },
  titleBlock: {
    marginTop: 2,
    gap: 2,
  },
  pageTitle: {
    fontFamily: "EternitaDisplay",
    fontSize: 34,
    color: COLORS.inkBrown,
    lineHeight: 38,
  },
  dateSubtitle: {
    fontFamily: "Georgia",
    fontStyle: "italic",
    fontSize: 13,
    color: COLORS.inkBrown,
  },
  writeForm: {
    gap: 10,
  },
  desktopWriteForm: {
    gap: 4,
  },
  desktopPageTitle: {
    fontSize: 30,
    lineHeight: 34,
  },
  desktopDateSubtitle: {
    fontSize: 11,
  },
  desktopFormLabel: {
    fontSize: 11,
  },
  desktopFieldRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  flexField: {
    flex: 1,
  },
  dateField: {
    minWidth: 120,
  },
  formSection: {
    gap: 5,
  },
  formLabel: {
    fontFamily: "Georgia",
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.inkBrown,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  formChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateInput: {
    minHeight: 34,
    borderWidth: 1.2,
    borderColor: COLORS.chipBorder,
    borderRadius: 8,
    backgroundColor: COLORS.cardCream,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontFamily: "Georgia",
    fontSize: 13,
    color: COLORS.inkBrown,
  },
  modeSelector: {
    flexDirection: "row",
    borderWidth: 1.3,
    borderColor: COLORS.chipBorder,
    borderRadius: 8,
    overflow: "hidden",
  },
  modeOption: {
    flex: 1,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "#E8A868",
  },
  modeSelected: {
    backgroundColor: COLORS.activeBrown,
  },
  modeText: {
    fontFamily: "Georgia",
    fontSize: 12,
    color: COLORS.inkBrown,
    textAlign: "center",
  },
  modeTextSelected: {
    color: "#FFF7EA",
  },
  modeDescription: {
    fontFamily: "Georgia",
    fontSize: 11,
    color: COLORS.inkMuted,
  },
  desktopModeDescription: {
    fontSize: 10,
    lineHeight: 12,
  },
  entryInput: {
    minHeight: 140,
    borderWidth: 1.4,
    borderColor: COLORS.chipBorder,
    borderRadius: 12,
    backgroundColor: "#D49B65",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkBrown,
  },
  desktopEntryInput: {
    minHeight: 60,
  },
  voiceNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  voiceGlyph: {
    fontSize: 19,
  },
  voiceCopy: {
    flex: 1,
    fontFamily: "Georgia",
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.inkMuted,
  },
  desktopVoiceNote: {
    gap: 6,
  },
  desktopVoiceCopy: {
    fontSize: 10,
    lineHeight: 12,
  },
  desktopVoiceGlyph: {
    fontSize: 16,
  },
  saveButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    backgroundColor: COLORS.activeBrown,
  },
  desktopSaveButton: {
    minHeight: 36,
  },
  saveButtonPressed: {
    backgroundColor: COLORS.accentRust,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    fontFamily: "EternitaDisplay",
    fontSize: 16,
    color: "#FFF7EA",
  },
  integrityNote: {
    fontFamily: "Georgia",
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.inkMuted,
    textAlign: "center",
  },
  desktopIntegrityNote: {
    fontSize: 10,
    lineHeight: 13,
  },
  legalNote: {
    fontFamily: "EternitaScript",
    fontSize: 15,
    lineHeight: 18,
    color: COLORS.inkBrown,
    textAlign: "center",
  },
  desktopLegalNote: {
    fontSize: 13,
    lineHeight: 16,
  },
  errorMessage: {
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.error,
    textAlign: "center",
  },
  statusMessage: {
    fontFamily: "Georgia",
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.success,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.chipTan,
    borderWidth: 1.2,
    borderColor: COLORS.chipBorder,
  },
  chipSelected: {
    backgroundColor: COLORS.activeBrown,
    borderColor: COLORS.inkBrown,
  },
  chipText: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 13,
    color: COLORS.inkBrown,
  },
  chipTextSelected: {
    color: "#FFF7EA",
  },
  entriesCount: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 17,
    color: COLORS.inkBrown,
    marginTop: 2,
  },
  emptyMessage: {
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkMuted,
    textAlign: "center",
    paddingVertical: 22,
  },
  cardsList: {
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.cardCream,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    shadowColor: COLORS.inkBrown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    backgroundColor: COLORS.cardPressed,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  entryDate: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 13,
    color: COLORS.accentRust,
  },
  entryCategory: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 12,
    color: COLORS.accentRust,
  },
  sourceBadge: {
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: "#F7B977",
  },
  sourceBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.inkBrown,
    letterSpacing: 0.4,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toneGlyph: {
    fontSize: 16,
    color: COLORS.sparkleBlue,
  },
  moonGlyph: {
    color: COLORS.inkBrown,
    fontSize: 15,
  },
  starGlyph: {
    fontSize: 17,
    color: COLORS.starInactive,
  },
  starActive: {
    color: COLORS.starYellow,
  },
  excerpt: {
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.inkBrown,
  },
  entryTags: {
    fontFamily: "Georgia",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.35,
    color: COLORS.inkMuted,
  },
  bottomDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.dockTan,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderColor: COLORS.chipBorder,
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
    color: COLORS.inkBrown,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.inkBrown,
  },
  tabActiveColor: {
    color: COLORS.activeBrown,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(29, 14, 4, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  entryModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    backgroundColor: "#FFCA8E",
    borderWidth: 1.5,
    borderColor: COLORS.chipBorder,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  modalTitle: {
    flex: 1,
    color: COLORS.inkBrown,
    fontFamily: "EternitaDisplay",
    fontSize: 20,
  },
  modalClose: {
    color: COLORS.inkBrown,
    fontSize: 28,
    lineHeight: 30,
  },
  modalTextScroll: {
    maxHeight: 360,
  },
  modalBody: {
    color: COLORS.inkBrown,
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 21,
  },
  modalEditor: {
    minHeight: 180,
    maxHeight: 420,
  },
  confirmDelete: {
    gap: 12,
  },
  modalActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  modalButton: {
    flexGrow: 1,
    minWidth: 100,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.activeBrown,
    borderColor: COLORS.chipBorder,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
  },
  modalButtonSecondary: {
    backgroundColor: "#E8A868",
  },
  modalButtonText: {
    color: "#FFF7EA",
    fontFamily: "EternitaDisplay",
    fontSize: 14,
  },
});
