import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AccessTokens } from "../../players/applicative/interfaces/access-tokens.js";
import { LegacyBoardStore } from "../applicative/interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import type { SerializedBoard } from "../domain/serialized-board.js";
import { OpponentsModule } from "../opponents.module.js";
import { InMemoryLegacyBoardStore } from "./in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "./in-memory-opponent-board.store.js";
import { SEED_BOARDS } from "./seed-boards.js";

const playerBoard = (round: number, randomSeed: number): SerializedBoard => ({
	round,
	faction: "Elf",
	size: { width: 8, height: 6 },
	randomSeed,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

const performance = { wins: 1, losses: 2 };

describe("POST /opponents/:round", () => {
	let app: INestApplication;
	let accessTokens: AccessTokens;

	beforeAll(() => {
		process.env["JWT_SECRET"] = "test-secret";
	});

	beforeEach(async () => {
		// In-memory stores seeded like the seed migration, so the test needs no database.
		const moduleRef = await Test.createTestingModule({ imports: [OpponentsModule] })
			.overrideProvider(OpponentBoardStore)
			.useValue(
				InMemoryOpponentBoardStore.seeded(SEED_BOARDS.map((board) => ({ board, performance: { wins: 0, losses: 0 } }))),
			)
			.overrideProvider(LegacyBoardStore)
			.useValue(new InMemoryLegacyBoardStore())
			.compile();
		app = moduleRef.createNestApplication();
		accessTokens = moduleRef.get(AccessTokens);
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	const pull = (round: number | string, body: object, accessToken?: string) => {
		const post = request(app.getHttpServer()).post(`/opponents/${round}`);
		return (accessToken ? post.set("Authorization", `Bearer ${accessToken}`) : post).send(body);
	};

	it("sends the seeded board of the round, then the board the previous player sent", async () => {
		const first = await pull(3, { board: playerBoard(3, 1), performance }).expect(200);
		expect(first.body).toEqual(SEED_BOARDS.find((board) => board.round === 3));

		const second = await pull(3, { board: playerBoard(3, 2), performance }).expect(200);
		expect(second.body).toEqual(playerBoard(3, 1));
	});

	it("never sends a logged-in player a board of theirs", async () => {
		const alice = await accessTokens.issue("alice");
		const seeded = SEED_BOARDS.find((board) => board.round === 3);

		const first = await pull(3, { board: playerBoard(3, 1), performance }, alice).expect(200);
		const second = await pull(3, { board: playerBoard(3, 2), performance }, alice).expect(200);

		expect(first.body).toEqual(seeded);
		expect(second.body.round).toBe(2);
	});

	it("refuses an invalid access token", async () => {
		await pull(3, { board: playerBoard(3, 1), performance }, "not-a-token").expect(401);
	});

	it("leaves the boards as they were for a test request", async () => {
		const seeded = SEED_BOARDS.find((board) => board.round === 3);

		const first = await pull("3?test=true", { board: playerBoard(3, 1), performance }).expect(200);
		const second = await pull(3, { board: playerBoard(3, 2), performance }).expect(200);

		expect(first.body).toEqual(seeded);
		expect(second.body).toEqual(seeded);
	});

	it("refuses a test flag that isn't a boolean", async () => {
		await pull("3?test=maybe", { board: playerBoard(3, 1), performance }).expect(400);
	});

	it("sends the last seeded board past the last seeded round", async () => {
		const lastRound = Math.max(...SEED_BOARDS.map((board) => board.round));

		const response = await pull(lastRound + 5, { board: playerBoard(lastRound + 5, 1), performance }).expect(200);

		expect(response.body.round).toBe(lastRound);
	});

	it.each(["0", "-1", "first"])("refuses round %s", async (round) => {
		await pull(round, { board: playerBoard(1, 1), performance }).expect(400);
	});

	it("refuses a board of another round", async () => {
		await pull(2, { board: playerBoard(1, 1), performance }).expect(400);
	});

	it("refuses a request without a board or a performance", async () => {
		await pull(1, { board: playerBoard(1, 1) }).expect(400);
		await pull(1, { performance }).expect(400);
	});
});
