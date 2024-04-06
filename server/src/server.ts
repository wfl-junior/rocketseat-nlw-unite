import fastify from "fastify";
import { z } from "zod";
import { prisma } from "./lib/prisma";

const app = fastify();

const createEventSchema = z.object({
  title: z.string(),
  details: z.string().nullish(),
  maximumAttendees: z.number().int().nullish(),
});

app.post("/events", async (request, response) => {
  const data = createEventSchema.parse(request.body);

  const event = await prisma.event.create({
    data: {
      ...data,
      slug: crypto.randomUUID(),
    },
  });

  response.status(201);
  return event;
});

const port = 3333;
await app.listen({ port });
console.log(`HTTP Server running at http://localhost:${port}`);
