import { useRouter } from "expo-router";
import { OwnerHomeScreen, type DiaryEntryItem } from "../screens/owner/OwnerHomeScreen";

const previewEntries: DiaryEntryItem[] = [
  { id: "preview-1", date: "2026-10-11", category: "Personal", source: "TEXT", excerpt: "Today I felt grateful for the quiet moments we shared. I want to remember how safe home felt.", aiTone: "sparkle", tags: ["family", "memory"], starred: true, isDraft: false },
  { id: "preview-2", date: "2026-10-08", category: "Family", source: "TEXT", excerpt: "We had dinner together and talked about the places we still want to visit.", aiTone: "moon", tags: ["family", "travel"], isDraft: true },
  { id: "preview-3", date: "2026-10-02", category: "Travel", source: "VOICE", excerpt: "The sea was calm this morning. I recorded this so I would not forget the sound.", aiTone: "sparkle", tags: ["travel"], isDraft: false },
];

export default function UiPreviewRoute() {
  const router = useRouter();
  return (
    <OwnerHomeScreen
      entries={previewEntries}
      previewMode
      onSignOut={() => router.replace("/")}
      onNavigateToAsker={() => router.replace("/asker")}
      onOpenRegister={() => router.push("/second-user-preview")}
    />
  );
}
