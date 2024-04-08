import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { ConflictError } from "./routes/errors/conflict";
import { NotFoundError } from "./routes/errors/not-found";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (
  error,
  _request,
  response,
) => {
  if (error instanceof NotFoundError) {
    return response.status(404).send({ message: error.message });
  }

  if (error instanceof ConflictError) {
    return response.status(409).send({ message: error.message });
  }

  if (error instanceof ZodError) {
    return response.status(422).send({
      message: "Validation error",
      errors: error.flatten().fieldErrors,
    });
  }

  console.error(error);
  return response.status(500).send({ message: "Houston, we have a problem" });
};
