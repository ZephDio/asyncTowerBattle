import type { PlayerStepsStore } from "../../applicative/interfaces/player-steps.store.js";
import { PlayerSteps } from "../../domain/player-steps.js";

// The behavior every PlayerStepsStore has. `playerIds` gives two players the store can hold steps for.
export const playerStepsStoreSuite = (
	name: string,
	setup: () => Promise<{ store: PlayerStepsStore; playerIds: [string, string] }>,
) => {
	describe(name, () => {
		it("finds no step done for a player without a row", async () => {
			const { store, playerIds } = await setup();
			expect(await store.find(playerIds[0])).toEqual(PlayerSteps.none(playerIds[0]));
		});

		it("saves the steps of a player without touching the others", async () => {
			const { store, playerIds } = await setup();
			await store.save(PlayerSteps.none(playerIds[0]).withTutorialSeen());
			expect((await store.find(playerIds[0])).tutorialSeen).toBe(true);
			expect((await store.find(playerIds[1])).tutorialSeen).toBe(false);
		});

		it("saves the same player's steps again", async () => {
			const { store, playerIds } = await setup();
			await store.save(PlayerSteps.none(playerIds[0]).withTutorialSeen());
			await store.save(PlayerSteps.none(playerIds[0]).withTutorialSeen());
			expect((await store.find(playerIds[0])).tutorialSeen).toBe(true);
		});
	});
};
