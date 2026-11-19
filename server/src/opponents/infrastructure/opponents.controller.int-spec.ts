import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { PrismaService } from "../../database/prisma.service.js";
import { assertTestDatabase } from "../../database/test-database.js";
import { AccessTokens } from "../../players/applicative/interfaces/access-tokens.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import { roundGridSize } from "../domain/board-rules.js";
import { defaultBoard } from "../domain/default-boards.js";
import { ROUND_POOL_SIZE } from "../domain/round-pool.js";
import type { SerializedBoard } from "../domain/serialized-board.js";
import { PlayerBoard } from "../domain/player-board.js";
import { OpponentsModule } from "../opponents.module.js";

// Runs the route on the Prisma stores, against the database that `pnpm test:integration` migrates.
assertTestDatabase();

const ROUND = 5;

const playerBoard = (randomSeed: number): SerializedBoard => ({
	round: ROUND,
	faction: "Elf",
	size: roundGridSize(ROUND),
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 6 } }],
});

const performance = { wins: 1, losses: 2 };

describe("POST /opponents/:round on Postgres", () => {
	let app: INestApplication;
	let prisma: PrismaService;
	let accessTokens: AccessTokens;
	let opponentBoards: OpponentBoardStore;

	beforeAll(async () => {
		process.env["JWT_SECRET"] = "test-secret";
		const moduleRef = await Test.createTestingModule({ imports: [OpponentsModule] }).compile();
		app = moduleRef.createNestApplication();
		prisma = moduleRef.get(PrismaService);
		accessTokens = moduleRef.get(AccessTokens);
		opponentBoards = moduleRef.get(OpponentBoardStore);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	// Back to the state the migrations leave: no board, no player, no count.
	beforeEach(async () => {
		await prisma.$transaction([
			prisma.playerBoard.deleteMany(),
			prisma.player.deleteMany(),
			prisma.roundBoardCount.deleteMany(),
		]);
	});

	const createPlayer = async (name: string) => {
		const id = crypto.randomUUID();
		await prisma.player.create({ data: { id, email: `${name}@test.local`, name, googleId: name } });
		return { id, token: await accessTokens.issue(id) };
	};

	const pull = (body: object, accessToken?: string) => {
		const post = request(app.getHttpServer()).post(`/opponents/${ROUND}`);
		return (accessToken ? post.set("Authorization", `Bearer ${accessToken}`) : post).send(body).expect(200);
	};

	const boardsOf = (playerId: string) =>
		prisma.playerBoard.findMany({ where: { playerId }, orderBy: { createdAt: "asc" } });

	// Stores boards of the round through the store, as the route would, so they count in the projection.
	const storeBoards = async (playerId: string, count: number) => {
		for (let index = 0; index < count; index++) {
			await opponentBoards.add(
				new PlayerBoard({ id: crypto.randomUUID(), board: playerBoard(1000 + index), performance, playerId }),
			);
		}
	};

	const expectProjectionToMatchRows = async () => {
		const projection = await prisma.roundBoardCount.findMany({ orderBy: { round: "asc" } });
		const rows = await prisma.playerBoard.groupBy({
			by: ["round"],
			where: { pulledAt: null },
			_count: true,
			orderBy: { round: "asc" },
		});
		expect(projection).toEqual(rows.map(({ round, _count }) => ({ round, count: _count })));
	};

	const roundCount = async () => (await prisma.roundBoardCount.findUniqueOrThrow({ where: { round: ROUND } })).count;

	it("sends the default board while the round has no other player's board, and still stores the player's", async () => {
		const alice = await createPlayer("alice");

		const first = await pull({ board: playerBoard(1), performance }, alice.token);
		const second = await pull({ board: playerBoard(2), performance }, alice.token);

		expect(first.body).toEqual({ board: defaultBoard(ROUND) });
		expect(second.body).toEqual({ board: defaultBoard(ROUND) });
		expect((await boardsOf(alice.id)).map(({ board }) => board)).toEqual([playerBoard(1), playerBoard(2)]);
		expect(await roundCount()).toBe(2);
		await expectProjectionToMatchRows();
	});

	it("sends another player's board, which stays available with each board that pulled it", async () => {
		const alice = await createPlayer("alice");
		const bob = await createPlayer("bob");
		await pull({ board: playerBoard(1), performance }, alice.token);

		for (const randomSeed of [2, 3, 4]) {
			const response = await pull({ board: playerBoard(randomSeed), performance }, bob.token);
			expect(response.body).toEqual({ board: playerBoard(1), playerName: "alice" });
		}
		const [aliceBoard] = await boardsOf(alice.id);
		expect(aliceBoard?.pulledBy).toEqual((await boardsOf(bob.id)).map(({ id }) => id));
	});

	it(`consumes nothing while the round holds no more than ${ROUND_POOL_SIZE} boards`, async () => {
		const carol = await createPlayer("carol");
		const bob = await createPlayer("bob");
		// With bob's, the round holds exactly ROUND_POOL_SIZE.
		await storeBoards(carol.id, ROUND_POOL_SIZE - 1);

		await pull({ board: playerBoard(1), performance }, bob.token);

		expect(await prisma.playerBoard.count({ where: { pulledAt: { not: null } } })).toBe(0);
		expect(await roundCount()).toBe(ROUND_POOL_SIZE);
		await expectProjectionToMatchRows();
	});

	it(`consumes the opponent once the round holds more than ${ROUND_POOL_SIZE} boards`, async () => {
		const carol = await createPlayer("carol");
		const bob = await createPlayer("bob");
		await storeBoards(carol.id, ROUND_POOL_SIZE);

		const response = await pull({ board: playerBoard(1), performance }, bob.token);

		const consumed = await prisma.playerBoard.findMany({ where: { pulledAt: { not: null } } });
		const [bobBoard] = await boardsOf(bob.id);
		expect(consumed).toHaveLength(1);
		expect(consumed[0]).toMatchObject({ playerId: carol.id, pulledBy: [bobBoard?.id] });
		expect(response.body).toEqual({ board: consumed[0]?.board, playerName: "carol" });
		expect(await roundCount()).toBe(ROUND_POOL_SIZE);
		await expectProjectionToMatchRows();
	});

	it("keeps the projection and every puller right under concurrent pulls", async () => {
		const carol = await createPlayer("carol");
		await storeBoards(carol.id, ROUND_POOL_SIZE);
		const players = await Promise.all(Array.from({ length: 10 }, (_, index) => createPlayer(`player${index}`)));

		await Promise.all(players.map(({ token }, index) => pull({ board: playerBoard(index), performance }, token)));

		const boards = await prisma.playerBoard.findMany({ where: { round: ROUND } });
		const pullers = boards.flatMap(({ pulledBy }) => pulledBy).sort();
		const sent = boards.filter(({ playerId }) => players.some(({ id }) => id === playerId)).map(({ id }) => id);
		expect(pullers).toEqual(sent.sort());
		await expectProjectionToMatchRows();
	});

	it("leaves the database as it was for a guest", async () => {
		const before = await prisma.playerBoard.findMany({ orderBy: { id: "asc" } });

		const response = await pull({ board: playerBoard(1), performance });

		expect(response.body).toEqual({ board: defaultBoard(ROUND) });
		expect(await prisma.playerBoard.findMany({ orderBy: { id: "asc" } })).toEqual(before);
		await expectProjectionToMatchRows();
	});
});
