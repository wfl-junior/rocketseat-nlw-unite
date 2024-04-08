import { prisma } from "../src/lib/prisma";

await prisma.event.create({
  data: {
    id: "d679cb29-c2bc-4f5a-b00f-7cdc92dd2f1e",
    title: "Unite Summit",
    slug: "unite-summit",
    details: "Um evento p/ devs apaixonados por código!",
    maximumAttendees: 120,
  },
});

console.log("✅ Database seeded!");
await prisma.$disconnect();
