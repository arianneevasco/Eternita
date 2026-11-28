import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { createInvite, type Invite } from "../../features/people/api";
import type { DiaryEntryItem } from "./OwnerHomeScreen";

type Screen = "Ask" | "Star" | "Legacy" | "Vault";
type Props = { screen: Screen; entries: DiaryEntryItem[]; idToken?: string; onOpenRegister?: () => void };
const ink = "#48280E";
const edge = "#684016";
const orange = "#FFAB58";
const card = "#E09A4D";
const months = ["2026-10", "2026-01", "2025-03", "2025-02", "2024-03"];
const moods = [
  { label: "Soft care", icon: "star-four-points" as const },
  { label: "Happiness", icon: "weather-sunny" as const },
  { label: "Pride", icon: null },
  { label: "Peace", icon: "moon-waning-crescent" as const },
];

function Saturn({ small = false }: { small?: boolean }) {
  return <View style={[styles.saturn, small && styles.saturnSmall]}><View style={[styles.saturnRing, small && styles.saturnRingSmall]} /><View style={[styles.saturnBody, small && styles.saturnBodySmall]} /></View>;
}

function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function OwnerAuxiliaryScreen({ screen, entries, idToken, onOpenRegister }: Props) {
  const { width } = useWindowDimensions();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("I answer only from entries you are allowed to see, I cite their dates, and I never pretend to be Maria.");
  const [month, setMonth] = useState(months[0]);
  const [selectedDay, setSelectedDay] = useState(11);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [invite, setInvite] = useState<Invite>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [policy, setPolicy] = useState("default_mode(light_fix).");
  const [compiled, setCompiled] = useState(false);
  const [pretendDate, setPretendDate] = useState("2027-12-01");

  const firstOfMonth = useMemo(() => {
    const [year, mon] = month.split("-").map(Number);
    return new Date(year, mon - 1, 1);
  }, [month]);
  const days = useMemo(() => {
    const firstDay = firstOfMonth.getDay();
    const count = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth() + 1, 0).getDate();
    const previousCount = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 0).getDate();
    return Array.from({ length: 35 }, (_, index) => {
      const date = index - firstDay + 1;
      if (date < 1) return { date: previousCount + date, outside: true };
      if (date > count) return { date: date - count, outside: true };
      return { date, outside: false };
    });
  }, [firstOfMonth]);

  async function registerPerson() {
    if (!idToken) {
      setMessage("Registration is available when connected to the owner account.");
      return;
    }
    if (!name.trim() || !handle.trim()) {
      setMessage("Enter their name and a unique handle.");
      return;
    }
    setBusy(true);
    try {
      const result = await createInvite(idToken, { name: name.trim(), handle: handle.trim().replace(/^@/, "").toLowerCase() });
      setInvite(result);
      setMessage("Invite created. Share this code with the person you trust.");
    } catch {
      setMessage("We could not create the invite. Check the details and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (screen === "Ask") {
    function askQuestion() {
      if (!question.trim()) return;
      setAnswer(`I can only answer from entries you are allowed to see. There is no matching entry in this local preview for “${question.trim()}”.`);
      setQuestion("");
    }
    return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Ask Eternita</Text>
      <View style={styles.legal}><MaterialCommunityIcons name="scale-balance" size={15} color="#8E2118" /><Text style={styles.legalText}>Not a legal will. Philippine law has formal requirements for wills.</Text></View>
      <Text style={styles.asking}>Asking as the <Text style={{ color: "#438BD5" }}>owner</Text> vault is <Text style={{ color: "#8951A2" }}>Sealed</Text>. Pretend today is:</Text>
      <View style={styles.dateSwitch}>{["2027-12-01", "2028-03-01"].map((date) => <Pressable key={date} onPress={() => setPretendDate(date)} style={[styles.dateOption, pretendDate === date && styles.dateSelected]}><Text style={[styles.body, pretendDate === date && styles.dateSelectedText]}>{date}</Text></Pressable>)}</View>
      <Card style={styles.answerCard}><Text style={styles.body}>{answer}</Text></Card>
      <Pressable onPress={() => setAnswer("There is no entry in the local preview that answers “Did he think about me?”.") } style={styles.suggestion}><Text style={styles.body}>Did he think about me?</Text></Pressable>
      <View style={styles.askInputRow}><TextInput value={question} onChangeText={setQuestion} placeholder="Ask question....." placeholderTextColor="#755332" style={styles.askInput} onSubmitEditing={askQuestion} returnKeyType="send"/><Pressable onPress={askQuestion} accessibilityLabel="Send question"><MaterialCommunityIcons name="send" size={18} color={ink} /></Pressable></View>
      <View style={styles.speechRow}><View style={styles.mic}><MaterialCommunityIcons name="microphone" size={17} color={ink} /></View><Text style={styles.caption}>Speech-to-text keeps the raw transcript and a cleaned copy.</Text></View>
    </ScrollView>;
  }

  if (screen === "Star") {
    return <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Constellation</Text>
      <View style={[styles.starfield, width >= 760 && styles.starfieldWide]}>
        {[["9%", "19%", 3], ["21%", "13%", 2], ["44%", "19%", 2], ["66%", "11%", 3], ["84%", "31%", 2], ["38%", "63%", 2], ["73%", "76%", 2], ["12%", "79%", 2], ["53%", "43%", 3], ["90%", "64%", 2], ["29%", "47%", 2], ["60%", "88%", 2]].map(([left, top, size], i) => <View key={i} style={[styles.starDot, { left: left as `${number}%`, top: top as `${number}%`, width: size as number, height: size as number }]} />)}
        <View style={styles.constellationLine} />
        <View style={styles.planet}><Saturn /></View>
        <MaterialCommunityIcons name="moon-waning-crescent" size={27} color="#168EE8" style={styles.moon} />
        <MaterialCommunityIcons name="star-four-points" size={25} color="#66C9FF" style={styles.constellationStar} />
      </View>
      <View style={styles.symbolCaption}><Text style={styles.body}>Top a symbol.</Text></View>
      <Text style={styles.sectionTitle}>Emotion Symbol</Text>
      <View style={styles.emotionCard}>{moods.map((mood) => <Pressable key={mood.label} style={styles.emotionItem}>{mood.icon ? <MaterialCommunityIcons name={mood.icon} size={23} color={ink} /> : <Saturn small />}<Text style={styles.emotionLabel}>{mood.label}</Text></Pressable>)}</View>
      <Text style={[styles.title, styles.moodTitle]}>Mood Insight</Text>
      <Text style={styles.sectionTitle}>Monthly Mood Calendar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>{months.map((item) => <Pressable key={item} onPress={() => { setMonth(item); setSelectedDay(11); }} style={[styles.monthChip, month === item && styles.monthChipSelected]}><Text style={styles.monthText}>{item}</Text></Pressable>)}</ScrollView>
      <View style={styles.calendar}>{["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"].map((day) => <View key={day} style={styles.weekday}><Text style={styles.weekdayText}>{day}</Text></View>)}{days.map((day, index) => <Pressable key={index} disabled={day.outside} onPress={() => setSelectedDay(day.date)} style={[styles.calendarDay, !day.outside && selectedDay === day.date && styles.calendarDaySelected]}><Text style={[styles.calendarDate, day.outside && styles.calendarOutside]}>{day.date}</Text>{!day.outside && day.date === 11 ? <MaterialCommunityIcons name="star-four-points" size={15} color="#65C8FF" style={styles.dayMoodIcon} /> : null}</Pressable>)}</View>
    </ScrollView>;
  }

  if (screen === "Legacy") {
    return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Legacy Mode</Text>
      <Text style={styles.sectionTitle}>Second User: None</Text>
      <View style={styles.statusCard}><Text style={styles.italic}>No one is registered yet. Nobody can see anything.</Text></View>
      <Pressable style={styles.registerButton} onPress={onOpenRegister ?? (() => setMessage("Scroll down to register a trusted person."))}><Text style={styles.buttonText}>+Register Second User</Text></Pressable>
      <Text style={styles.sectionTitle}>How to register someone Safely</Text>
      <Card style={styles.safetyCard}><Text style={styles.body}>• Pick someone you trust and say how they are related. Eternita suggests a starting access level.{"\n"}• Start with the least access. You can add more before the death trigger.{"\n"}• Prefer summaries over full reads for sensitive topics.{"\n"}• Use release dates for letters, so they open only when you choose.{"\n"}• Add deny rules for private topics. Deny always beats allow.{"\n"}• They verify their identity (ID digits and face) the first time they sign in.{"\n"}• After the death trigger the policy is frozen and they can only read, never edit.</Text></Card>
      <Text style={styles.sectionTitle}>Death Trigger</Text>
      <Card><Text style={styles.body}>After it, the policy is frozen and second user may ask question.</Text><Pressable style={styles.outlineButton} onPress={() => setMessage("Death trigger simulation is unavailable in UI preview.")}><Text style={styles.buttonTextDark}>Fire trigger (Simulate)</Text></Pressable></Card>
      <Pressable style={styles.policyHeading} onPress={() => setCompiled(false)}><Text style={styles.buttonText}>▾ Advance Policy Text And Prolog Facts</Text><Text style={styles.captionLight}>Registering or editing a second user rewrites this text.</Text></Pressable>
      <View style={styles.policyPanel}><TextInput value={policy} onChangeText={setPolicy} multiline style={styles.policyInput} /><Pressable style={styles.compileButton} onPress={() => setCompiled(true)}><Text style={styles.buttonText}>Compile</Text></Pressable>{compiled ? <><Text style={styles.sectionTitle}>Compiled Facts</Text><Text style={styles.body}>default_mode(light_fix).</Text></> : null}</View>
      <Text style={styles.sectionTitle}>Second User</Text><Text style={styles.titleSmall}>Register a trusted person</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Full name (use an invented name)" placeholderTextColor="#755332" style={styles.formInput} />
      <TextInput value={handle} onChangeText={setHandle} placeholder="Email or Phone" placeholderTextColor="#755332" style={styles.formInput} />
      <Text style={styles.body}>Fill sample: Maria Dela Cruz</Text><Text style={styles.sectionTitle}>Relationship</Text><View style={styles.relationship}><Text style={styles.captionLight}>Trusted person</Text></View>
      <Card><Text style={styles.smallLabel}>SUGGESTED ACCESS</Text><Text style={styles.body}>A person you trust. Start with the least access: they learn that entries mentioning them exist, read summaries of family entries, and receive your letter on its date. Business notes stay hidden. Add more only if you need to.</Text></Card>
      <Text style={styles.sectionTitle}>What they may see</Text><Card><Text style={styles.smallLabel}>SUGGESTED ACCESS</Text><Text style={styles.body}>A person you trust. Start with the least access: they learn that entries mentioning them exist, read summaries of family entries, and receive your letter on its date. Business notes stay hidden. Add more only if you need to.</Text></Card>
      <Pressable onPress={registerPerson} disabled={busy} style={styles.registerButton}><Text style={styles.buttonText}>{busy ? "Registering…" : "Register Second User"}</Text></Pressable>
      {invite ? <Card><Text style={styles.sectionTitle}>Invite code</Text><Text style={styles.body}>{invite.code}</Text></Card> : null}{message ? <Text style={styles.caption}>{message}</Text> : null}
    </ScrollView>;
  }

  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Vault</Text>
    <Card style={styles.hashCard}><Text style={styles.sectionTitle}>Hash chain: {entries.length + 3} blocks</Text><Text style={styles.body}>Start with the least access. You can add more before the death trigger.</Text></Card>
    <Text style={styles.sectionTitle}>The 3 parts of the AI</Text>
    <Card style={styles.aiCard}><Text style={styles.body}><Text style={styles.bold}>Model</Text> · Gemini 2.5 Flash{"\n"}<Text style={styles.bold}>Tools</Text> · search_entries, check_access, fetch_entry, cite_formatter{"\n"}<Text style={styles.bold}>Instructions</Text> · use only permitted entries, cite dates, quote real words, never pretend to be Ramon, say so when there is no record</Text></Card>
    <Text style={styles.sectionTitle}>Paradigm per component</Text>
    <Card style={styles.paradigmCard}><Text style={styles.body}>Diary model: object-oriented{"\n"}Entry pipeline: functional{"\n"}Writing modes: object-oriented{"\n"}Access rules: logic (Prolog){"\n"}Legacy Policy: language design{"\n"}Grounded Q&amp;A: scripting</Text></Card>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 106, gap: 7 },
  title: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 30, lineHeight: 38 },
  titleSmall: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 23, lineHeight: 29 },
  sectionTitle: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 15, lineHeight: 19 },
  body: { color: ink, fontFamily: "Georgia", fontSize: 12, lineHeight: 16 },
  bold: { fontFamily: "Georgia", fontWeight: "700" },
  caption: { color: "#755332", fontFamily: "Georgia", fontSize: 11, lineHeight: 15 },
  captionLight: { color: "#F8D9B8", fontFamily: "Georgia", fontSize: 11 },
  card: { padding: 12, gap: 9, backgroundColor: card, borderWidth: 1, borderColor: edge, borderRadius: 10 },
  legal: { minHeight: 39, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#AA291B", borderRadius: 10, backgroundColor: "#E39B54" },
  legalText: { color: "#FAE3D0", fontFamily: "EternitaScript", fontSize: 14, flexShrink: 1 },
  asking: { color: "#593817", fontFamily: "Georgia", fontSize: 12, lineHeight: 18, paddingHorizontal: 5 },
  dateSwitch: { flexDirection: "row", borderWidth: 2, borderColor: edge, borderRadius: 20, overflow: "hidden" },
  dateOption: { flex: 1, minHeight: 32, justifyContent: "center", alignItems: "center", backgroundColor: "#FFB362" },
  dateSelected: { backgroundColor: "#995D1F" },
  dateSelectedText: { color: "#FFF4E4" },
  answerCard: { minHeight: 66, justifyContent: "center", borderRadius: 18, backgroundColor: "#FFB362", marginTop: 5, paddingHorizontal: 18 },
  suggestion: { alignSelf: "flex-start", paddingHorizontal: 15, paddingVertical: 8, borderWidth: 1, borderColor: "#A66624", backgroundColor: "#FFB362", borderRadius: 18, marginTop: 2 },
  askInputRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, minHeight: 45, borderRadius: 9, backgroundColor: "#C99866" },
  askInput: { flex: 1, paddingVertical: 10, fontFamily: "Georgia", fontSize: 13, color: ink },
  speechRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 5 },
  mic: { width: 30, height: 30, borderRadius: 16, backgroundColor: "#D79A54", alignItems: "center", justifyContent: "center" },
  starfield: { height: 220, borderRadius: 18, borderWidth: 1, borderColor: "#28170C", backgroundColor: "#020203", overflow: "hidden", position: "relative", marginTop: 1 },
  starfieldWide: { height: 290 },
  starDot: { position: "absolute", borderRadius: 4, backgroundColor: "#FFF", shadowColor: "#FFF", shadowOpacity: 0.9, shadowRadius: 7 },
  constellationLine: { position: "absolute", top: "50%", left: "15%", width: "69%", borderTopWidth: 1.5, borderColor: "#04D8F4", borderStyle: "dashed", transform: [{ rotate: "20deg" }] },
  planet: { position: "absolute", left: "14%", top: "18%" },
  saturn: { width: 34, height: 29, alignItems: "center", justifyContent: "center" },
  saturnRing: { position: "absolute", width: 34, height: 13, borderRadius: 12, borderWidth: 2, borderColor: "#CAD1DC", transform: [{ rotate: "-16deg" }] },
  saturnBody: { width: 18, height: 18, borderRadius: 10, backgroundColor: "#D6DCE5", borderWidth: 1, borderColor: "#69727F" },
  saturnSmall: { width: 28, height: 24 },
  saturnRingSmall: { width: 27, height: 11, borderColor: ink, borderWidth: 1.5 },
  saturnBodySmall: { width: 14, height: 14, backgroundColor: "#9B6A35", borderColor: "#593817" },
  moon: { position: "absolute", left: "43%", top: "48%" },
  constellationStar: { position: "absolute", right: "28%", bottom: "23%" },
  symbolCaption: { minHeight: 35, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: edge, borderRadius: 10, backgroundColor: card },
  emotionCard: { minHeight: 68, flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderWidth: 1, borderColor: edge, borderRadius: 10, backgroundColor: card, paddingVertical: 7 },
  emotionItem: { alignItems: "center", gap: 3, minWidth: 60 },
  emotionLabel: { color: ink, fontFamily: "Georgia", fontSize: 10 },
  moodTitle: { marginTop: 1, fontSize: 29, lineHeight: 34 },
  months: { gap: 9, paddingRight: 8 },
  monthChip: { minWidth: 70, height: 22, alignItems: "center", justifyContent: "center", paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: edge, backgroundColor: "#EAA259" },
  monthChipSelected: { backgroundColor: "#995D1F" },
  monthText: { color: ink, fontFamily: "Georgia", fontSize: 9 },
  calendar: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#EAA259", borderRadius: 4, overflow: "hidden" },
  weekday: { width: `${100 / 7}%`, height: 29, justifyContent: "center", alignItems: "center", backgroundColor: "#DC954A" },
  weekdayText: { color: ink, fontFamily: "Georgia", fontWeight: "700", fontSize: 10 },
  calendarDay: { width: `${100 / 7}%`, height: 38, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderBottomWidth: 1, borderColor: "#AD6A2F", position: "relative" },
  calendarDaySelected: { backgroundColor: "#FFB76E" },
  calendarDate: { color: ink, fontFamily: "Georgia", fontWeight: "700", fontSize: 11 },
  calendarOutside: { color: "#9E6637" },
  dayMoodIcon: { position: "absolute", right: 5, top: 7 },
  statusCard: { minHeight: 39, justifyContent: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: edge, borderRadius: 10, backgroundColor: card },
  italic: { color: "#F8E5D1", fontFamily: "EternitaScript", fontSize: 14, fontStyle: "italic" },
  registerButton: { minHeight: 36, justifyContent: "center", alignItems: "center", borderRadius: 18, backgroundColor: "#A75905", borderColor: "#B16B20", borderWidth: 2 },
  buttonText: { color: "#FFF6EA", fontFamily: "EternitaDisplayBold", fontSize: 14 },
  buttonTextDark: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 13 },
  safetyCard: { padding: 11 },
  outlineButton: { height: 29, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: edge, borderRadius: 14, backgroundColor: orange, marginTop: 4 },
  policyHeading: { backgroundColor: "#AE6D2B", padding: 10, borderColor: edge, borderWidth: 1, borderTopLeftRadius: 7, borderTopRightRadius: 7, gap: 4 },
  policyPanel: { padding: 10, gap: 6, backgroundColor: "#AE6D2B", borderColor: edge, borderWidth: 1, marginTop: -7 },
  policyInput: { minHeight: 88, padding: 9, backgroundColor: "#C99866", color: ink, borderWidth: 1, borderColor: "#805326", borderRadius: 5, fontFamily: "Georgia", textAlignVertical: "top" },
  compileButton: { height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17, backgroundColor: "#895017" },
  formInput: { minHeight: 36, paddingHorizontal: 10, borderWidth: 1, borderColor: "#805326", borderRadius: 9, backgroundColor: "#C99866", color: ink, fontFamily: "Georgia", fontSize: 11 },
  relationship: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, backgroundColor: "#A76520", borderRadius: 14 },
  smallLabel: { color: ink, fontFamily: "Georgia", fontWeight: "700", fontSize: 9 },
  hashCard: { minHeight: 116 },
  aiCard: { paddingHorizontal: 16 },
  paradigmCard: { minHeight: 113 },
});
