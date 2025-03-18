import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production, use a new PrismaClient
  prisma = new PrismaClient();
} else {
  // In development, use a cached instance and enable logging
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

export default prisma;
