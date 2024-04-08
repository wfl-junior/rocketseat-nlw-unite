import { z } from "zod";

export const conflictResponseSchema = z.object({
  message: z.string(),
});
