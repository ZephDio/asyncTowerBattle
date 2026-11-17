import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { HealthModule } from "./health.module.js";

describe("GET /health", () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [HealthModule] }).compile();
		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it("reports the server as healthy", async () => {
		const response = await request(app.getHttpServer()).get("/health").expect(200);

		expect(response.body).toEqual({ status: "ok", uptime: expect.any(Number) });
	});
});
