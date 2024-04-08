import { z } from "zod";

export const notFoundResponseSchema = z.object({
  message: z.string(),
});
