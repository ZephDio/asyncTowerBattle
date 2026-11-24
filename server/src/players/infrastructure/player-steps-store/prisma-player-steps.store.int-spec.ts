import { PrismaService } from "../../../database/prisma.service.js";
import { assertTestDatabase } from "../../../database/test-database.js";
import { PrismaPlayerStepsStore } from "./prisma-player-steps.store.js";
import { playerStepsStoreSuite } from "./player-steps.store.test-suite.js";

// Runs the store on the database that `pnpm test:integration` migrates.
assertTestDatabase();

const prisma = new PrismaService();

const addPlayer = async (name: string) => {
	const id = crypto.randomUUID();
	await prisma.player.create({ data: { id, email: `${name}@test.local`, name, googleId: name } });
	return id;
};

afterAll(() => prisma.$disconnect());

playerStepsStoreSuite("PrismaPlayerStepsStore", async () => {
	await prisma.$transaction([prisma.playerSteps.deleteMany(), prisma.player.deleteMany()]);
	return { store: new PrismaPlayerStepsStore(prisma), playerIds: [await addPlayer("alice"), await addPlayer("bob")] };
});
