import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { conflictResponseSchema } from "../validation/conflict-response";
import { notFoundResponseSchema } from "../validation/not-found-response";
import { unprocessableEntityResponseSchema } from "../validation/unprocessable-entity-response";
import { ConflictError } from "./errors/conflict";
import { NotFoundError } from "./errors/not-found";

export async function registerForEventRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register an attendee",
        tags: ["attendees"],
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
          404: notFoundResponseSchema,
          409: conflictResponseSchema,
          422: unprocessableEntityResponseSchema,
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
          throw new NotFoundError("Event not found");
        }

        if (
          typeof event.maximumAttendees === "number" &&
          event._count.attendees >= event.maximumAttendees
        ) {
          throw new ConflictError("This event is full");
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
          throw new ConflictError("E-mail already registered to this event");
        }

        throw error;
      }
    },
  );
}
