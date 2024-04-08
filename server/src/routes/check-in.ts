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

export async function checkInRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendees/:attendeeId/check-in",
    {
      schema: {
        summary: "Check-in an attendee",
        tags: ["check-ins"],
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
          }),
          404: notFoundResponseSchema,
          409: conflictResponseSchema,
          422: unprocessableEntityResponseSchema,
        },
      },
    },
    async (request, response) => {
      try {
        const { attendeeId } = request.params;

        await prisma.checkIn.create({
          data: { attendeeId },
        });

        return response.status(201).send({ success: true });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new ConflictError("Attendee already checked in");
          }

          if (error.code === "P2003") {
            throw new NotFoundError("Attendee not found");
          }
        }

        throw error;
      }
    },
  );
}
