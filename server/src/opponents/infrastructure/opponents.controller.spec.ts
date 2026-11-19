import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AccessTokens } from "../../players/applicative/interfaces/access-tokens.js";
import { LegacyBoardStore } from "../applicative/interfaces/legacy-board.store.js";
import { OpponentBoardStore } from "../applicative/interfaces/opponent-board.store.js";
import { PlayerNames } from "../applicative/interfaces/player-names.js";
import { roundGridSize } from "../domain/board-rules.js";
import { DEFAULT_BOARDS, defaultBoard } from "../domain/default-boards.js";
import type { SerializedBoard } from "../domain/serialized-board.js";
import { OpponentsModule } from "../opponents.module.js";
import { InMemoryLegacyBoardStore } from "./legacy-board-store/in-memory-legacy-board.store.js";
import { InMemoryOpponentBoardStore } from "./opponent-board-store/in-memory-opponent-board.store.js";
import { InMemoryPlayerNames } from "./in-memory-player-names.js";

const playerBoard = (round: number, randomSeed: number): SerializedBoard => ({
	round,
	faction: "Elf",
	size: roundGridSize(round),
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
		// Empty in-memory stores, so the test needs no database and the first pull of a round gets its default board.
		const moduleRef = await Test.createTestingModule({ imports: [OpponentsModule] })
			.overrideProvider(OpponentBoardStore)
			.useValue(new InMemoryOpponentBoardStore())
			.overrideProvider(LegacyBoardStore)
			.useValue(new InMemoryLegacyBoardStore())
			.overrideProvider(PlayerNames)
			.useValue(new InMemoryPlayerNames({ alice: "Alice" }))
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

	it("sends the default board of the round, then the board the previous player sent with their name", async () => {
		const first = await pull(3, { board: playerBoard(3, 1), performance }, await accessTokens.issue("alice")).expect(
			200,
		);
		expect(first.body).toEqual({ board: defaultBoard(3) });

		const second = await pull(3, { board: playerBoard(3, 2), performance }, await accessTokens.issue("bob")).expect(
			200,
		);
		expect(second.body).toEqual({ board: playerBoard(3, 1), playerName: "Alice" });
	});

	it("leaves the boards as they were for a guest", async () => {
		const fallback = defaultBoard(3);

		const first = await pull(3, { board: playerBoard(3, 1), performance }).expect(200);
		const second = await pull(3, { board: playerBoard(3, 2), performance }, await accessTokens.issue("bob")).expect(
			200,
		);

		expect(first.body).toEqual({ board: fallback });
		expect(second.body).toEqual({ board: fallback });
	});

	it("never sends a logged-in player a board of theirs", async () => {
		const alice = await accessTokens.issue("alice");
		const fallback = defaultBoard(3);

		const first = await pull(3, { board: playerBoard(3, 1), performance }, alice).expect(200);
		const second = await pull(3, { board: playerBoard(3, 2), performance }, alice).expect(200);

		// The round's only board is alice's, so she meets the default board again.
		expect(first.body).toEqual({ board: fallback });
		expect(second.body).toEqual({ board: fallback });
	});

	it("refuses an invalid access token", async () => {
		await pull(3, { board: playerBoard(3, 1), performance }, "not-a-token").expect(401);
	});

	it("leaves the boards as they were for a test request", async () => {
		const fallback = defaultBoard(3);

		const first = await pull(
			"3?test=true",
			{ board: playerBoard(3, 1), performance },
			await accessTokens.issue("alice"),
		).expect(200);
		const second = await pull(3, { board: playerBoard(3, 2), performance }, await accessTokens.issue("bob")).expect(
			200,
		);

		expect(first.body).toEqual({ board: fallback });
		expect(second.body).toEqual({ board: fallback });
	});

	it("refuses a test flag that isn't a boolean", async () => {
		await pull("3?test=maybe", { board: playerBoard(3, 1), performance }).expect(400);
	});

	it("sends the last default board past the last round that has one", async () => {
		const lastRound = Math.max(...DEFAULT_BOARDS.map((board) => board.round));

		const response = await pull(lastRound + 5, { board: playerBoard(lastRound + 5, 1), performance }).expect(200);

		expect(response.body.board.round).toBe(lastRound);
	});

	it.each(["0", "-1", "first"])("refuses round %s", async (round) => {
		await pull(round, { board: playerBoard(1, 1), performance }).expect(400);
	});

	it("refuses a board of another round", async () => {
		await pull(2, { board: playerBoard(1, 1), performance }).expect(400);
	});

	it("refuses a board without the grid size of its round", async () => {
		await pull(3, { board: { ...playerBoard(3, 1), size: { width: 8, height: 6 } }, performance }).expect(400);
		await pull(3, { board: { ...playerBoard(3, 1), size: undefined }, performance }).expect(400);
	});

	it.each([-1, 0.5, 2 ** 31, "seed"])("refuses random seed %p", async (randomSeed) => {
		await pull(3, { board: { ...playerBoard(3, 1), randomSeed }, performance }).expect(400);
	});

	it.each([
		{ wins: -1, losses: 0 },
		{ wins: 0, losses: 0.5 },
	])("refuses performance %o", async (invalid) => {
		await pull(3, { board: playerBoard(3, 1), performance: invalid }).expect(400);
	});

	it("refuses a request without a board or a performance", async () => {
		await pull(1, { board: playerBoard(1, 1) }).expect(400);
		await pull(1, { performance }).expect(400);
	});
});
