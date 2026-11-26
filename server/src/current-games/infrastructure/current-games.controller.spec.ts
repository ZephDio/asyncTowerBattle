import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AccessTokens } from "../../players/applicative/interfaces/access-tokens.js";
import { CurrentGameStore } from "../applicative/interfaces/current-game.store.js";
import { CurrentGamesModule } from "../current-games.module.js";
import { board, savedGame } from "../domain/current-game-fixtures.js";
import { InMemoryCurrentGameStore } from "./current-game-store/in-memory-current-game.store.js";

describe("/current-game", () => {
	let app: INestApplication;
	let accessTokens: AccessTokens;

	beforeAll(() => {
		process.env["JWT_SECRET"] = "test-secret";
	});

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [CurrentGamesModule] })
			.overrideProvider(CurrentGameStore)
			.useValue(new InMemoryCurrentGameStore())
			.compile();
		app = moduleRef.createNestApplication();
		accessTokens = moduleRef.get(AccessTokens);
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	const as = async (playerId: string) => `Bearer ${await accessTokens.issue(playerId)}`;
	const server = () => request(app.getHttpServer());

	it("has no game for a player who never saved one", async () => {
		const response = await server()
			.get("/current-game")
			.set("Authorization", await as("alice"))
			.expect(200);

		expect(response.body).toEqual({ game: null });
	});

	it("gives a player the game they saved last, and nobody else's", async () => {
		const first = savedGame({ gold: 10 });
		const second = savedGame({
			phase: "battle",
			gold: 3,
			opponent: { board: { ...board(2), randomSeed: 5 }, playerName: "Bob" },
		});
		await server()
			.put("/current-game")
			.set("Authorization", await as("alice"))
			.send(first)
			.expect(204);
		await server()
			.put("/current-game")
			.set("Authorization", await as("alice"))
			.send(second)
			.expect(204);

		const alice = await server()
			.get("/current-game")
			.set("Authorization", await as("alice"))
			.expect(200);
		const bob = await server()
			.get("/current-game")
			.set("Authorization", await as("bob"))
			.expect(200);

		expect(alice.body).toEqual({ game: second });
		expect(bob.body).toEqual({ game: null });
	});

	it("forgets the game of a player whose game is over", async () => {
		await server()
			.put("/current-game")
			.set("Authorization", await as("alice"))
			.send(savedGame())
			.expect(204);

		await server()
			.delete("/current-game")
			.set("Authorization", await as("alice"))
			.expect(204);

		const response = await server()
			.get("/current-game")
			.set("Authorization", await as("alice"))
			.expect(200);
		expect(response.body).toEqual({ game: null });
	});

	it("refuses requests without a valid access token", async () => {
		await server().get("/current-game").expect(401);
		await server().put("/current-game").send(savedGame()).expect(401);
		await server().delete("/current-game").set("Authorization", "Bearer nope").expect(401);
	});

	it("refuses a body that isn't a saved game", async () => {
		const authorization = await as("alice");
		const put = (body: object) => server().put("/current-game").set("Authorization", authorization).send(body);

		await put({}).expect(400);
		await put({ ...savedGame(), phase: "summary" }).expect(400);
		await put({ ...savedGame(), runSeed: "1" }).expect(400);
		await put({ ...savedGame(), inventory: [{ kind: 3 }] }).expect(400);
		await put({ ...savedGame(), opponent: { board: board(2) } }).expect(400);
		await put({ ...savedGame(), reservedOffers: [{ item: { kind: "totem", cell: { x: 1, y: 3 } } }] }).expect(400);
		await put({ ...savedGame(), reservedOffers: {} }).expect(400);
	});

	it("takes a game saved without reserved offers as one with none", async () => {
		const authorization = await as("alice");
		const { reservedOffers: _, ...older } = savedGame();
		await server().put("/current-game").set("Authorization", authorization).send(older).expect(204);

		const response = await server().get("/current-game").set("Authorization", authorization).expect(200);
		expect(response.body).toEqual({ game: { ...older, reservedOffers: [] } });
	});

	it("refuses a saved game that breaks the rules", async () => {
		const authorization = await as("alice");
		const put = (body: object) => server().put("/current-game").set("Authorization", authorization).send(body);

		await put(savedGame({ life: 0 })).expect(400);
		await put(savedGame({ phase: "battle" })).expect(400);
		await put(savedGame({ board: { ...board(2), size: { width: 1, height: 1 } } })).expect(400);
	});
});
