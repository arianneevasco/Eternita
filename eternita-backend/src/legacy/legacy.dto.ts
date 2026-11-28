import { z } from "zod";

export const ownerUidSchema = z.object({
  ownerUid: z.string().trim().min(1).max(128),
}).strict();
export type OwnerUidDto = z.infer<typeof ownerUidSchema>;
