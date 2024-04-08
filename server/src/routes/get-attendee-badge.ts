import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { notFoundResponseSchema } from "../validation/not-found-response";
import { unprocessableEntityResponseSchema } from "../validation/unprocessable-entity-response";
import { NotFoundError } from "./errors/not-found";

export async function getAttendeeBadgeRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/badge",
    {
      schema: {
        summary: "Get an attendee badge",
        tags: ["attendees"],
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string().email(),
              eventTitle: z.string(),
              checkInURL: z.string().url(),
            }),
          }),
          404: notFoundResponseSchema,
          422: unprocessableEntityResponseSchema,
        },
      },
    },
    async request => {
      const { attendeeId } = request.params;
      const attendee = await prisma.attendee.findUnique({
        where: {
          id: attendeeId,
        },
        select: {
          name: true,
          email: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!attendee) {
        throw new NotFoundError("Attendee not found");
      }

      const baseUrl = `${request.protocol}://${request.hostname}`;
      const checkInUrl = new URL(`/attendees/${attendeeId}/check-in`, baseUrl);

      return {
        badge: {
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          checkInURL: checkInUrl.toString(),
        },
      };
    },
  );
}
