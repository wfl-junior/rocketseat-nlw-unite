import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { unprocessableEntityResponseSchema } from "../validation/unprocessable-entity-response";

export async function getEventAttendeesRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Get all event attendees",
        tags: ["attendees"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        querystring: z.object({
          query: z.string().optional(),
          pageIndex: z.coerce.number().int().min(0).optional().default(0),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.number().int(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable(),
              }),
            ),
          }),
          422: unprocessableEntityResponseSchema,
        },
      },
    },
    async request => {
      const { eventId } = request.params;
      const { query, pageIndex } = request.query;
      const perPage = 10;

      const attendees = await prisma.attendee.findMany({
        take: perPage,
        skip: pageIndex * perPage,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          checkIn: {
            select: {
              createdAt: true,
            },
          },
        },
        where: {
          eventId,
          name: {
            contains: query,
          },
        },
      });

      return {
        attendees: attendees.map(attendee => ({
          id: attendee.id,
          name: attendee.name,
          email: attendee.email,
          createdAt: attendee.createdAt,
          checkedInAt: attendee.checkIn?.createdAt ?? null,
        })),
      };
    },
  );
}
