import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createInvite, type Invite } from "../../features/people/api";
import type { DiaryEntryItem } from "./OwnerHomeScreen";

type Screen = "Ask" | "Star" | "Legacy" | "Vault";

type Props = {
  screen: Screen;
  entries: DiaryEntryItem[];
  idToken?: string;
};

const colors = {
  ink: "#44280B",
  muted: "#684B31",
  background: "#FFAB58",
  card: "#F4C48F",
  border: "#593817",
  accent: "#995D1F",
  light: "#FFF7EA",
};

const feelings = ["Soft care", "Happiness", "Pride", "Peace"];

export function OwnerAuxiliaryScreen({ screen, entries, idToken }: Props) {
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [invite, setInvite] = useState<Invite>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedDay, setSelectedDay] = useState(13);

  async function registerPerson() {
    if (!idToken) {
      setMessage("Sign in with your owner account to create an invite.");
      return;
    }
    if (!name.trim() || !handle.trim()) {
      setMessage("Enter their name and a unique handle.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await createInvite(idToken, {
        name: name.trim(),
        handle: handle.trim().replace(/^@/, "").toLowerCase(),
      });
      setInvite(result);
      setMessage("Invite created. Share this code with the person you trust.");
      setName("");
      setHandle("");
    } catch {
      setMessage("We could not create the invite. Check the details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (screen === "Ask") {
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ask Eternita</Text>
        <Text style={styles.subtitle}>A thoughtful way to ask about shared memories.</Text>
        <View style={styles.notice}>
          <View style={styles.row}>
            <Text style={styles.noticeTitle}>Access is locked</Text>
            <Text style={styles.badge}>PRIVATE</Text>
          </View>
          <Text style={styles.body}>
            The owner decides what can be shared. Access is available only when the owner’s rules allow it and legacy access is active.
          </Text>
        </View>
        <Text style={styles.sectionTitle}>Ask about a memory</Text>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask question....."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.question]}
          accessibilityLabel="Ask about a memory"
        />
        <Pressable disabled style={[styles.action, styles.actionDisabled]}>
          <Text style={styles.actionText}>Ask a question  ›</Text>
        </Pressable>
        <Text style={styles.caption}>
          Questions are answered only from memories the owner has permitted. Asking is unavailable while the vault is sealed.
        </Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your conversation will begin here</Text>
          <Text style={styles.body}>No permitted diary entries are available to answer this question.</Text>
        </View>
      </ScrollView>
    );
  }

  if (screen === "Star") {
    const days = Array.from({ length: 35 }, (_, index) => index - 2);
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Constellation</Text>
        <Text style={styles.subtitle}>Mood Insight</Text>
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Monthly Mood Calendar</Text>
          <View style={styles.monthRow}>
            <Pressable onPress={() => setSelectedDay(1)} accessibilityLabel="Previous month">
              <Text style={styles.monthArrow}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>2026-10</Text>
            <Pressable onPress={() => setSelectedDay(31)} accessibilityLabel="Next month">
              <Text style={styles.monthArrow}>›</Text>
            </Pressable>
          </View>
          <View style={styles.calendar}>
            {["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekday}>{day}</Text>
            ))}
            {days.map((day, index) => {
              const inMonth = day > 0 && day <= 31;
              const active = day === selectedDay;
              return (
                <Pressable
                  key={`${day}-${index}`}
                  disabled={!inMonth}
                  onPress={() => setSelectedDay(day)}
                  style={[styles.day, active && styles.dayActive]}
                  accessibilityLabel={inMonth ? `October ${day}` : undefined}
                >
                  <Text style={[styles.dayText, !inMonth && styles.dayOutside, active && styles.dayTextActive]}>
                    {inMonth ? day : ""}
                  </Text>
                  {inMonth && [5, 12, 19, 28].includes(day) ? (
                    <Text style={[styles.dayMood, active && styles.dayTextActive]}>
                      {day % 2 ? "✦" : "☾"}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
          <View style={styles.selectionNote}>
            <Text style={styles.sectionTitle}>Tuesday - 2 Entries - Mood</Text>
            <Text style={styles.body}>Selected day: October {selectedDay}</Text>
          </View>
        </View>
        <View style={styles.feelingList}>
          {feelings.map((feeling, index) => (
            <View key={feeling} style={styles.feelingRow}>
              <Text style={styles.feelingGlyph}>{["✦", "☼", "❂", "☾"][index]}</Text>
              <Text style={styles.body}>{feeling}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.caption}>Mood symbols appear on days with saved entries. {entries.length} entries are in your diary.</Text>
      </ScrollView>
    );
  }

  if (screen === "Legacy") {
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Legacy</Text>
        <Text style={styles.subtitle}>Choose what can be shared, and with whom.</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>No second user yet</Text>
          <Text style={styles.body}>Nobody can see anything until you register a trusted person and choose what they can access.</Text>
        </View>
        <Text style={styles.sectionTitle}>Register a second user</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Their name" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput value={handle} onChangeText={setHandle} placeholder="Unique handle" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />
        <Pressable onPress={registerPerson} disabled={busy} style={styles.action} accessibilityRole="button">
          <Text style={styles.actionText}>{busy ? "Creating invite…" : "Create invite"}</Text>
        </Pressable>
        {invite ? <View style={styles.codeCard}><Text style={styles.badge}>INVITE CODE</Text><Text selectable style={styles.inviteCode}>{invite.code}</Text><Text style={styles.body}>For @{invite.handle} · expires {invite.expiresAt}</Text></View> : null}
        {message ? <Text accessibilityRole="alert" style={styles.caption}>{message}</Text> : null}
        <Text style={styles.sectionTitle}>The 3 parts of the AI</Text>
        <View style={styles.panel}>
          <Text style={styles.body}>Model · Gemini 2.5 Flash</Text>
          <Text style={styles.body}>Tools · search entries, check access, fetch entry, cite formatter</Text>
          <Text style={styles.body}>Instructions · use only permitted entries, cite dates, and say when there is no record.</Text>
        </View>
        <Text style={styles.caption}>A Letter of Wishes is a personal message, not a legal will.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Vault</Text>
      <Text style={styles.subtitle}>Your private diary is sealed and protected.</Text>
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Hash chain: {entries.length} blocks</Text>
        <Text style={styles.body}>Each saved entry is linked to its predecessor. Editing adds a new version to the chain; deletion hides an entry without removing its history.</Text>
      </View>
      <Text style={styles.sectionTitle}>How the vault is protected</Text>
      <View style={styles.panel}>
        <Text style={styles.body}>Diary model · object-oriented</Text>
        <Text style={styles.body}>Entry pipeline · functional</Text>
        <Text style={styles.body}>Writing modes · object-oriented</Text>
        <Text style={styles.body}>Access rules · logic (Prolog)</Text>
        <Text style={styles.body}>Legacy policy · language design</Text>
      </View>
      <Text style={styles.caption}>Your entries remain private unless you choose to share them.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 108 },
  title: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 32, lineHeight: 38 },
  subtitle: { color: colors.ink, fontFamily: "Georgia", fontStyle: "italic", fontSize: 13 },
  sectionTitle: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 19 },
  body: { color: colors.ink, fontFamily: "Georgia", fontSize: 13, lineHeight: 19 },
  notice: { padding: 14, gap: 8, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16 },
  noticeTitle: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 19 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  badge: { color: colors.accent, borderColor: colors.border, borderWidth: 1, overflow: "hidden", borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  input: { minHeight: 44, borderWidth: 1.5, borderColor: colors.border, borderRadius: 10, backgroundColor: "#C99866", color: colors.ink, paddingHorizontal: 12, paddingVertical: 10, fontFamily: "Georgia", fontSize: 14 },
  question: { minHeight: 108 },
  action: { minHeight: 40, justifyContent: "center", alignItems: "center", backgroundColor: colors.accent, borderColor: colors.border, borderWidth: 1, borderRadius: 18 },
  actionDisabled: { opacity: 0.55 },
  actionText: { color: colors.light, fontFamily: "EternitaDisplay", fontSize: 16 },
  caption: { color: colors.muted, fontFamily: "Georgia", fontSize: 11, lineHeight: 16, textAlign: "center" },
  emptyState: { minHeight: 118, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: "#E6A361", alignItems: "center", justifyContent: "center", padding: 18, gap: 8 },
  emptyTitle: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 18, textAlign: "center" },
  panel: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  monthRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  monthTitle: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 19 },
  monthArrow: { color: colors.accent, fontSize: 30, paddingHorizontal: 12 },
  calendar: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  weekday: { width: "14.28%", textAlign: "center", color: colors.muted, fontSize: 10, fontWeight: "700", paddingVertical: 7 },
  day: { width: "14.28%", minHeight: 43, alignItems: "center", justifyContent: "center", borderRadius: 22 },
  dayActive: { backgroundColor: colors.accent },
  dayText: { color: colors.ink, fontSize: 12 },
  dayTextActive: { color: colors.light, fontWeight: "700" },
  dayOutside: { color: "transparent" },
  dayMood: { color: colors.accent, fontSize: 9, lineHeight: 10 },
  selectionNote: { borderTopWidth: 1, borderColor: "#C58A51", paddingTop: 10, gap: 4 },
  feelingList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  feelingRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: "#E9AE70" },
  feelingGlyph: { color: colors.accent, fontSize: 14 },
  codeCard: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14, alignItems: "center", padding: 14, gap: 6 },
  inviteCode: { color: colors.ink, fontFamily: "EternitaDisplay", fontSize: 27, letterSpacing: 2 },
});
