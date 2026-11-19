import { PrismaService } from "../../../database/prisma.service.js";
import { assertTestDatabase } from "../../../database/test-database.js";
import { MathRandomProvider } from "../../../shared/infrastructure/math-random-provider.js";
import { opponentBoard, opponentBoardStoreSuite } from "./opponent-board.store.test-suite.js";
import { PrismaOpponentBoardStore } from "./prisma-opponent-board.store.js";

// Runs the store on the database that `pnpm test:integration` migrates.
assertTestDatabase();

const prisma = new PrismaService();

// Back to the state the migrations leave: no board, no player, no count.
const clear = async () => {
	await prisma.$transaction([
		prisma.playerBoard.deleteMany(),
		prisma.player.deleteMany(),
		prisma.roundBoardCount.deleteMany(),
	]);
};

const addPlayer = async (name: string) => {
	const id = crypto.randomUUID();
	await prisma.player.create({ data: { id, email: `${name}@test.local`, name, googleId: name } });
	return id;
};

// The round_board_count projection must match the available rows after every test, the suite's included. A round
// whose boards were all consumed keeps its row at 0, which counts the same as no row.
afterEach(async () => {
	const projection = await prisma.roundBoardCount.findMany({ where: { count: { gt: 0 } }, orderBy: { round: "asc" } });
	const rows = await prisma.playerBoard.groupBy({
		by: ["round"],
		where: { pulledAt: null },
		_count: true,
		orderBy: { round: "asc" },
	});
	expect(projection).toEqual(rows.map(({ round, _count }) => ({ round, count: _count })));
});

afterAll(async () => {
	await prisma.$disconnect();
});

const rowOf = (id: string) => prisma.playerBoard.findUniqueOrThrow({ where: { id } });

opponentBoardStoreSuite("PrismaOpponentBoardStore", {
	createStore: (random) => new PrismaOpponentBoardStore(prisma, random),
	addPlayer,
	removePlayer: async (id) => {
		await prisma.player.delete({ where: { id } });
	},
	pullersOf: async (id) => (await rowOf(id)).pulledBy,
	clear,
});

// What only the rows show: the columns a board is stored in, and when it was consumed.
describe("PrismaOpponentBoardStore rows", () => {
	const store = new PrismaOpponentBoardStore(prisma, new MathRandomProvider());

	beforeEach(clear);

	it("stores the board in its columns, available and pulled by nobody", async () => {
		const alice = await addPlayer("alice");
		const added = opponentBoard(4, 40, alice);

		await store.add(added);

		expect(await rowOf(added.id)).toMatchObject({
			round: 4,
			board: added.board,
			wins: 2,
			losses: 1,
			playerId: alice,
			pulledAt: null,
			pulledBy: [],
		});
	});

	it("keeps when the first remove consumed the board", async () => {
		const removed = opponentBoard(2, 20);
		await store.add(removed);
		await store.remove(removed.id, crypto.randomUUID());
		const { pulledAt } = await rowOf(removed.id);

		await store.remove(removed.id, crypto.randomUUID());

		expect(pulledAt).toEqual(expect.any(Date));
		expect((await rowOf(removed.id)).pulledAt).toEqual(pulledAt);
	});
});
