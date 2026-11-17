import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: { path: "prisma/migrations" },
	// Not `env()` from prisma/config, which throws when the variable is missing, even for `prisma generate`.
	datasource: { url: process.env["DATABASE_URL"] ?? "" },
});
