import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const ink = "#48280E";

export function SecondUserPreviewScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.kicker}>Second User</Text>
    <Text style={styles.title}>Register a trusted person</Text>
    <TextInput value={name} onChangeText={setName} placeholder="Full name (use an invented name)" placeholderTextColor="#765334" style={styles.input} />
    <TextInput value={contact} onChangeText={setContact} placeholder="Email or Phone" placeholderTextColor="#765334" style={styles.input} />
    <Text style={styles.sample}>Fill sample: Maria Dela Cruz</Text>
    <Text style={styles.label}>Relationship</Text>
    <View style={styles.relationship}><Text style={styles.relationshipText}>Trusted person</Text></View>
    <View style={styles.card}><Text style={styles.cardTitle}>SUGGESTED ACCESS</Text><Text style={styles.body}>A person you trust. Start with the least access: they learn that entries mentioning them exist, read summaries of family entries, and receive your letter on its date. Business notes stay hidden. Add more only if you need to.</Text></View>
    <Text style={styles.label}>What they may see</Text>
    <View style={styles.card}><Text style={styles.cardTitle}>SUGGESTED ACCESS</Text><Text style={styles.body}>A person you trust. Start with the least access: they learn that entries mentioning them exist, read summaries of family entries, and receive your letter on its date. Business notes stay hidden. Add more only if you need to.</Text></View>
    <View style={styles.actions}><Pressable onPress={() => setMessage("This screen is in local UI preview. No invitation was sent.")} style={styles.primary}><Text style={styles.primaryText}>Register Second User</Text></Pressable><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>Back</Text></Pressable></View>
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFAB58" },
  content: { flexGrow: 1, paddingHorizontal: 10, paddingTop: 14, paddingBottom: 30, gap: 6 },
  kicker: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 15, lineHeight: 20 },
  title: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 23, lineHeight: 28 },
  input: { minHeight: 35, borderWidth: 1, borderColor: "#805326", borderRadius: 10, paddingHorizontal: 11, backgroundColor: "#C99866", color: ink, fontFamily: "Georgia", fontSize: 11 },
  sample: { color: ink, fontFamily: "Georgia", fontSize: 11, marginTop: -3 },
  label: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 14, lineHeight: 17 },
  relationship: { alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 5, backgroundColor: "#A76520", borderRadius: 16, marginTop: -5, marginBottom: 0 },
  relationshipText: { color: "#F8D9B8", fontFamily: "Georgia", fontSize: 10 },
  card: { paddingHorizontal: 13, paddingVertical: 11, gap: 5, borderWidth: 1, borderColor: "#684016", borderRadius: 10, backgroundColor: "#E09A4D", marginBottom: 3 },
  cardTitle: { color: ink, fontFamily: "Georgia", fontSize: 9, fontWeight: "700" },
  body: { color: ink, fontFamily: "Georgia", fontSize: 11, lineHeight: 15 },
  actions: { flexDirection: "row", gap: 8, marginTop: 4 },
  primary: { flex: 1, minHeight: 38, justifyContent: "center", alignItems: "center", borderRadius: 20, backgroundColor: "#A75905", borderWidth: 1, borderColor: "#B16B20" },
  primaryText: { color: "#FFF6EA", fontFamily: "EternitaDisplayBold", fontSize: 14 },
  back: { minWidth: 80, minHeight: 38, justifyContent: "center", alignItems: "center", borderRadius: 20, borderWidth: 1, borderColor: "#684016" },
  backText: { color: ink, fontFamily: "EternitaDisplayBold", fontSize: 14 },
  message: { color: ink, fontFamily: "Georgia", fontSize: 11, textAlign: "center" },
});
