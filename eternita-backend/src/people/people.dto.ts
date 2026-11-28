import { z } from "zod";

export const createInviteSchema = z.object({
  handle: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(100),
}).strict();
export type CreateInviteDto = z.infer<typeof createInviteSchema>;

export const joinInviteSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{6,64}$/),
  name: z.string().trim().min(1).max(100),
}).strict();
export type JoinInviteDto = z.infer<typeof joinInviteSchema>;
