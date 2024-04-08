import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { notFoundResponseSchema } from "../validation/not-found-response";
import { unprocessableEntityResponseSchema } from "../validation/unprocessable-entity-response";
import { NotFoundError } from "./errors/not-found";

export async function getEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId",
    {
      schema: {
        summary: "Get an event by id",
        tags: ["events"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            event: z.object({
              id: z.string().uuid(),
              title: z.string(),
              slug: z.string(),
              details: z.string().nullable(),
              maximumAttendees: z.number().int().nullable(),
              attendeesAmount: z.number().int(),
            }),
          }),
          404: notFoundResponseSchema,
          422: unprocessableEntityResponseSchema,
        },
      },
    },
    async request => {
      const { eventId } = request.params;

      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        select: {
          id: true,
          slug: true,
          title: true,
          details: true,
          maximumAttendees: true,
          _count: {
            select: {
              attendees: true,
            },
          },
        },
      });

      if (!event) {
        throw new NotFoundError("Event not found");
      }

      return {
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          details: event.details,
          maximumAttendees: event.maximumAttendees,
          attendeesAmount: event._count.attendees,
        },
      };
    },
  );
}
