import { z } from "zod";

export const unprocessableEntityResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())),
});
