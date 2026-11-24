import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AccessTokens } from "../applicative/interfaces/access-tokens.js";
import { PlayerStepsStore } from "../applicative/interfaces/player-steps.store.js";
import { PlayersModule } from "../players.module.js";
import { InMemoryPlayerStepsStore } from "./player-steps-store/in-memory-player-steps.store.js";

describe("/players/me/steps", () => {
	let app: INestApplication;
	let accessTokens: AccessTokens;

	beforeAll(() => {
		process.env["JWT_SECRET"] = "test-secret";
	});

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [PlayersModule] })
			.overrideProvider(PlayerStepsStore)
			.useValue(new InMemoryPlayerStepsStore())
			.compile();
		app = moduleRef.createNestApplication();
		accessTokens = moduleRef.get(AccessTokens);
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it("tells the tutorial is unseen, then seen once the player marked it, for that player only", async () => {
		const alice = `Bearer ${await accessTokens.issue("alice")}`;
		const bob = `Bearer ${await accessTokens.issue("bob")}`;
		const server = app.getHttpServer();

		const before = await request(server).get("/players/me/steps").set("Authorization", alice).expect(200);
		expect(before.body).toEqual({ tutorialSeen: false });

		await request(server).post("/players/me/steps/tutorial-seen").set("Authorization", alice).expect(204);

		const after = await request(server).get("/players/me/steps").set("Authorization", alice).expect(200);
		expect(after.body).toEqual({ tutorialSeen: true });
		const other = await request(server).get("/players/me/steps").set("Authorization", bob).expect(200);
		expect(other.body).toEqual({ tutorialSeen: false });
	});

	it("refuses a request without an access token", async () => {
		await request(app.getHttpServer()).get("/players/me/steps").expect(401);
		await request(app.getHttpServer()).post("/players/me/steps/tutorial-seen").expect(401);
	});
});
