import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { errorHandler } from "./error-handler";
import { checkInRoute } from "./routes/check-in";
import { createEventRoute } from "./routes/create-event";
import { getAttendeeBadgeRoute } from "./routes/get-attendee-badge";
import { getEventRoute } from "./routes/get-event";
import { getEventAttendeesRoute } from "./routes/get-event-attendees";
import { registerForEventRoute } from "./routes/register-for-event";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifySwagger, {
  transform: jsonSchemaTransform,
  swagger: {
    consumes: ["application/json"],
    produces: ["application/json"],
    info: {
      title: "pass.in",
      version: "1.0.0",
      description:
        "Especificações da API para o back-end da aplicação pass.in construída durante o NLW Unite da Rocketseat.",
    },
  },
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(checkInRoute);
app.register(getEventRoute);
app.register(createEventRoute);
app.register(registerForEventRoute);
app.register(getAttendeeBadgeRoute);
app.register(getEventAttendeesRoute);

app.setErrorHandler(errorHandler);

const port = 3333;
await app.listen({ port, host: "0.0.0.0" });
console.log(`HTTP Server running at http://localhost:${port}`);
console.log(`Swagger at http://localhost:${port}/docs`);
