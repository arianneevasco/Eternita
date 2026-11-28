import { apiRequest } from "../../api/client";

export type WritingMode = "verbatim" | "lightfix" | "review";

export type BackendTimestamp =
  | string
  | { seconds: number; nanoseconds: number };

export interface EntryContent {
  title: string;
  originalText: string;
  journal: string;
  entryDate: string;
  entryTime: string;
  mood: number;
  people: string[];
  tags: string[];
  isFavorite: boolean;
  isDraft: boolean;
  writingMode: WritingMode;
}

export type CreateEntryInput = Pick<
  EntryContent,
  | "title"
  | "originalText"
  | "journal"
  | "entryDate"
  | "entryTime"
  | "mood"
> &
  Partial<
    Pick<
      EntryContent,
      "people" | "tags" | "isFavorite" | "isDraft" | "writingMode"
    >
  >;

export type EditEntryInput = Partial<EntryContent>;

export interface DiaryEntry extends EntryContent {
  id: string;
  entryId?: string;
  finalText: string;
  isHidden: boolean;
  currentVersion: number;
  previousHash: string;
  entryHash: string;
  createdAt: BackendTimestamp;
  updatedAt: BackendTimestamp;
}

export interface EntryVersion {
  id: string;
  entryId: string;
  version: number;
  content: EntryContent;
  previousHash: string;
  entryHash: string;
  createdAt: BackendTimestamp;
}

export function createEntry(
  idToken: string,
  input: CreateEntryInput
): Promise<DiaryEntry> {
  return apiRequest<DiaryEntry>("/entries", {
    method: "POST",
    idToken,
    body: input,
  });
}

export function listEntries(
  idToken: string
): Promise<DiaryEntry[]> {
  return apiRequest<DiaryEntry[] | { entries: DiaryEntry[] }>("/entries", {
    idToken,
  }).then((result) => Array.isArray(result) ? result : result.entries);
}

export interface PublishEntryResult {
  entryId: string;
  previousHash: string;
  entryHash: string;
  sequence: number;
  publishedAt: BackendTimestamp;
}

export function publishEntry(
  idToken: string,
  entryId: string
): Promise<PublishEntryResult> {
  return apiRequest<PublishEntryResult>(
    `/entries/${encodeURIComponent(entryId)}/publish`,
    { method: "POST", idToken },
  );
}

export function getEntry(
  idToken: string,
  entryId: string
): Promise<DiaryEntry> {
  return apiRequest<DiaryEntry>(
    `/entries/${encodeURIComponent(entryId)}`,
    { idToken }
  );
}

export function editEntry(
  idToken: string,
  entryId: string,
  input: EditEntryInput
): Promise<DiaryEntry> {
  return apiRequest<DiaryEntry>(
    `/entries/${encodeURIComponent(entryId)}`,
    {
      method: "PATCH",
      idToken,
      body: input,
    }
  );
}

export function setEntryFavorite(
  idToken: string,
  entryId: string,
  isFavorite: boolean
): Promise<{ id: string; isFavorite: boolean }> {
  return apiRequest<{ id: string; isFavorite: boolean }>(
    `/entries/${encodeURIComponent(entryId)}/favorite`,
    {
      method: "PATCH",
      idToken,
      body: { isFavorite },
    }
  );
}

export function hideEntry(
  idToken: string,
  entryId: string
): Promise<{ id: string; isHidden: boolean }> {
  return apiRequest<{ id: string; isHidden: boolean }>(
    `/entries/${encodeURIComponent(entryId)}`,
    { method: "DELETE", idToken }
  );
}

export function listEntryVersions(
  idToken: string,
  entryId: string
): Promise<{ versions: EntryVersion[] }> {
  return apiRequest<{ versions: EntryVersion[] }>(
    `/entries/${encodeURIComponent(entryId)}/versions`,
    { idToken }
  );
}
