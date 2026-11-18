import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { GoogleIdentityVerifier } from "../applicative/interfaces/google-identity.verifier.js";
import { PlayerStore } from "../applicative/interfaces/player.store.js";
import { RefreshTokenStore } from "../applicative/interfaces/refresh-token.store.js";
import { PlayersModule } from "../players.module.js";
import { FakeGoogleIdentityVerifier } from "./fake-google-identity.verifier.js";
import { InMemoryPlayerStore } from "./in-memory-player.store.js";
import { InMemoryRefreshTokenStore } from "./in-memory-refresh-token.store.js";

describe("auth and player routes", () => {
	let app: INestApplication;

	beforeAll(() => {
		process.env["JWT_SECRET"] = "test-secret";
	});

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [PlayersModule] })
			.overrideProvider(GoogleIdentityVerifier)
			.useValue(new FakeGoogleIdentityVerifier())
			.overrideProvider(PlayerStore)
			.useValue(new InMemoryPlayerStore())
			.overrideProvider(RefreshTokenStore)
			.useValue(new InMemoryRefreshTokenStore())
			.compile();
		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	const post = (path: string, body: object) => request(app.getHttpServer()).post(path).send(body);
	const me = (accessToken: string) =>
		request(app.getHttpServer()).get("/players/me").set("Authorization", `Bearer ${accessToken}`);
	const register = (googleId: string, name = "Zeph") =>
		post("/auth/google/register", { credential: `google:${googleId}`, name });

	it("registers a player and gives their profile to their access token", async () => {
		const { body: session } = await register("1", "  Zeph ").expect(201);

		expect(session.player).toEqual({ id: expect.any(String), email: "1@example.com", name: "Zeph" });
		expect(session.refreshToken).toEqual(expect.any(String));
		expect((await me(session.accessToken).expect(200)).body).toEqual(session.player);
	});

	it("logs a registered player in", async () => {
		const { body: registered } = await register("1").expect(201);

		const { body: session } = await post("/auth/google/login", { credential: "google:1" }).expect(200);

		expect(session.player).toEqual(registered.player);
	});

	it("refuses to log in an account with no player", async () => {
		await post("/auth/google/login", { credential: "google:1" }).expect(404);
	});

	it("refuses to register an account twice", async () => {
		await register("1").expect(201);
		await register("1").expect(409);
	});

	it.each(["Z", "a name longer than twenty"])("refuses the name %p", async (name) => {
		await register("1", name).expect(400);
	});

	it("refuses an invalid Google credential", async () => {
		await post("/auth/google/login", { credential: "forged" }).expect(401);
		await post("/auth/google/register", { credential: "forged", name: "Zeph" }).expect(401);
	});

	it("refuses requests without their fields", async () => {
		await post("/auth/google/login", {}).expect(400);
		await post("/auth/google/register", { credential: "google:1" }).expect(400);
		await post("/auth/refresh", {}).expect(400);
	});

	it("trades a refresh token once for a new session", async () => {
		const { body: first } = await register("1").expect(201);

		const { body: second } = await post("/auth/refresh", { refreshToken: first.refreshToken }).expect(200);

		expect(second.player).toEqual(first.player);
		expect(second.refreshToken).not.toBe(first.refreshToken);
		await me(second.accessToken).expect(200);
		await post("/auth/refresh", { refreshToken: first.refreshToken }).expect(401);
	});

	it("revokes the refresh token on logout", async () => {
		const { body: session } = await register("1").expect(201);

		await post("/auth/logout", { refreshToken: session.refreshToken }).expect(204);

		await post("/auth/refresh", { refreshToken: session.refreshToken }).expect(401);
	});

	it("refuses the profile route without a valid access token", async () => {
		await request(app.getHttpServer()).get("/players/me").expect(401);
		await me("not-a-jwt").expect(401);
	});
});
