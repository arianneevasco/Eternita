import { z } from "zod";

export const entryAccessSchema = z.enum(["existence", "summary", "full"]).default("full");
export type EntryAccessDto = z.infer<typeof entryAccessSchema>;

export const favoriteSchema = z.object({
  isFavorite: z.boolean(),
}).strict();
export type FavoriteDto = z.infer<typeof favoriteSchema>;
