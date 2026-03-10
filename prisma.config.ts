import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Placeholder cho prisma generate (build phase chưa có DATABASE_URL)
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/placeholder",
  },
});
