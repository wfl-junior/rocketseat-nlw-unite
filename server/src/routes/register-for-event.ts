import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number().int(),
          }),
          404: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, response) => {
      try {
        const { eventId } = request.params;
        const data = request.body;

        const event = await prisma.event.findUnique({
          where: {
            id: eventId,
          },
          select: {
            maximumAttendees: true,
            _count: {
              select: {
                attendees: true,
              },
            },
          },
        });

        if (!event) {
          return response.status(404).send({ message: "Event not found" });
        }

        if (
          typeof event.maximumAttendees === "number" &&
          event._count.attendees >= event.maximumAttendees
        ) {
          return response.status(409).send({
            message: "This event is full",
          });
        }

        const attendee = await prisma.attendee.create({
          data: {
            ...data,
            eventId,
          },
        });

        return response.status(201).send({
          attendeeId: attendee.id,
        });
      } catch (error) {
        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return response.status(409).send({
            message: "E-mail already registered to this event",
          });
        }

        throw error;
      }
    },
  );
}
