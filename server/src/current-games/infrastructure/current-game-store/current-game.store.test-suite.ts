import type { CurrentGameStore } from "../../applicative/interfaces/current-game.store.js";
import { CurrentGame } from "../../domain/current-game.js";
import { savedGame } from "../../domain/current-game-fixtures.js";

export type CurrentGameStoreSuiteParams = {
	createStore: () => CurrentGameStore;
	// Makes a player who can have a game and gives back their id.
	addPlayer: (name: string) => Promise<string>;
	clear: () => Promise<void>;
	close?: () => Promise<void>;
};

// The behavior every CurrentGameStore must have, checked through the port alone.
export const currentGameStoreSuite = (name: string, params: CurrentGameStoreSuiteParams) =>
	describe(`${name} (CurrentGameStore suite)`, () => {
		let store: CurrentGameStore;

		beforeEach(async () => {
			await params.clear();
			store = params.createStore();
		});

		afterAll(async () => {
			await params.clear();
			await params.close?.();
		});

		it("finds nothing for a player with no game", async () => {
			expect(await store.find(await params.addPlayer("alice"))).toBeUndefined();
		});

		it("gives back the game it saved", async () => {
			const playerId = await params.addPlayer("alice");
			const currentGame = new CurrentGame({ playerId, game: savedGame() });

			await store.save(currentGame);

			expect((await store.find(playerId))?.toProps()).toEqual(currentGame.toProps());
		});

		it("replaces the game of the player on a second save, and only theirs", async () => {
			const alice = await params.addPlayer("alice");
			const bob = await params.addPlayer("bob");
			await store.save(new CurrentGame({ playerId: alice, game: savedGame({ gold: 10 }) }));
			await store.save(new CurrentGame({ playerId: bob, game: savedGame({ gold: 99 }) }));

			await store.save(new CurrentGame({ playerId: alice, game: savedGame({ gold: 20 }) }));

			expect((await store.find(alice))?.game.gold).toBe(20);
			expect((await store.find(bob))?.game.gold).toBe(99);
		});

		it("forgets a deleted game, and deleting no game is fine", async () => {
			const playerId = await params.addPlayer("alice");
			await store.save(new CurrentGame({ playerId, game: savedGame() }));

			await store.delete(playerId);
			await store.delete(playerId);

			expect(await store.find(playerId)).toBeUndefined();
		});
	});
