import { PrismaService } from "../../../database/prisma.service.js";
import { assertTestDatabase } from "../../../database/test-database.js";
import { currentGameStoreSuite } from "./current-game.store.test-suite.js";
import { PrismaCurrentGameStore } from "./prisma-current-game.store.js";

// Runs the store on the database that `pnpm test:integration` migrates.
assertTestDatabase();

const prisma = new PrismaService();

currentGameStoreSuite("PrismaCurrentGameStore", {
	createStore: () => new PrismaCurrentGameStore(prisma),
	addPlayer: async (name) => {
		const id = crypto.randomUUID();
		await prisma.player.create({ data: { id, email: `${name}@test.local`, name, googleId: name } });
		return id;
	},
	clear: async () => {
		await prisma.$transaction([prisma.currentGame.deleteMany(), prisma.player.deleteMany()]);
	},
});

afterAll(async () => {
	await prisma.$disconnect();
});

describe("the current_game table", () => {
	beforeEach(async () => {
		await prisma.$transaction([prisma.currentGame.deleteMany(), prisma.player.deleteMany()]);
	});

	it("goes with its player", async () => {
		const id = crypto.randomUUID();
		await prisma.player.create({ data: { id, email: "carol@test.local", name: "carol", googleId: "carol" } });
		await prisma.currentGame.create({ data: { playerId: id, game: {} } });

		await prisma.player.delete({ where: { id } });

		expect(await prisma.currentGame.count()).toBe(0);
	});
});
