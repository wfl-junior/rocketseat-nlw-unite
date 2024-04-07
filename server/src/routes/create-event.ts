import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generate-slug";

export async function createEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        body: z.object({
          title: z.string(),
          details: z.string().nullish(),
          maximumAttendees: z.number().int().nullish(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
          409: z.object({
            message: z.string(),
          }),
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
          return response.status(409).send({
            message: "Slug already in use",
          });
        }

        throw error;
      }
    },
  );
}
