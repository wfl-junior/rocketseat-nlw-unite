import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generate-slug";
import { conflictResponseSchema } from "../validation/conflict-response";
import { unprocessableEntityResponseSchema } from "../validation/unprocessable-entity-response";
import { ConflictError } from "./errors/conflict";

export async function createEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        summary: "Create an event",
        tags: ["events"],
        body: z.object({
          title: z.string(),
          details: z.string().nullish(),
          maximumAttendees: z.number().int().nullish(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
          409: conflictResponseSchema,
          422: unprocessableEntityResponseSchema,
        },
      },
    },
    async (request, response) => {
      const data = request.body;

      try {
        const event = await prisma.event.create({
          data: {
            ...data,
            slug: generateSlug(data.title),
          },
        });

        return response.status(201).send({
          eventId: event.id,
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new ConflictError("Slug already in use");
        }

        throw error;
      }
    },
  );
}
