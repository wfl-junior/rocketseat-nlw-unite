import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { createEventRoute } from "./routes/create-event";
import { getAttendeeBadgeRoute } from "./routes/get-attendee-badge";
import { getEventRoute } from "./routes/get-event";
import { registerForEventRoute } from "./routes/register-for-event";

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(getEventRoute);
app.register(createEventRoute);
app.register(registerForEventRoute);
app.register(getAttendeeBadgeRoute);

const port = 3333;
await app.listen({ port });
console.log(`HTTP Server running at http://localhost:${port}`);
