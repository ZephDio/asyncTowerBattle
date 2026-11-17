import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { OpponentsModule } from "../opponents.module.js";
import { SEED_BOARDS } from "./seed-boards.js";

describe("GET /opponents/:round", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [OpponentsModule] }).compile();
		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("sends the seeded board of the round", async () => {
		const response = await request(app.getHttpServer()).get("/opponents/3").expect(200);

		expect(response.body).toEqual(SEED_BOARDS.find((board) => board.round === 3));
	});

	it("sends the last seeded board past the last seeded round", async () => {
		const lastRound = Math.max(...SEED_BOARDS.map((board) => board.round));

		const response = await request(app.getHttpServer())
			.get(`/opponents/${lastRound + 5}`)
			.expect(200);

		expect(response.body.round).toBe(lastRound);
	});

	it.each(["0", "-1", "first"])("refuses round %s", async (round) => {
		await request(app.getHttpServer()).get(`/opponents/${round}`).expect(400);
	});
});
