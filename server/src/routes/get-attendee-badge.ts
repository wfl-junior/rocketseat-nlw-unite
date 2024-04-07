import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function getAttendeeBadgeRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/badge",
    {
      schema: {
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
        response: {
          200: z.object({}),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, response) => {
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
        return response.status(404).send({ message: "Attendee not found" });
      }

      return {};
    },
  );
}
