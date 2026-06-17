import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  if (globalForPrisma.prisma) {
    prismaInstance = globalForPrisma.prisma;
  } else {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
} else {
  // Client-side fallback proxy
  prismaInstance = new Proxy({} as any, {
    get() {
      throw new Error("Cannot execute database queries on the client side.");
    }
  });
}

export const prisma = prismaInstance;
