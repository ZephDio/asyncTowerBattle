import { PlayerSteps } from "../../domain/player-steps.js";
import { InMemoryPlayerStepsStore } from "../../infrastructure/player-steps-store/in-memory-player-steps.store.js";
import { GetPlayerSteps } from "../queries/get-player-steps.use-case.js";
import { SeeTutorial } from "./see-tutorial.use-case.js";

describe("SeeTutorial", () => {
	it("keeps the tutorial unseen until the player sees it, for that player only", async () => {
		const store = new InMemoryPlayerStepsStore();
		const get = new GetPlayerSteps(store);
		expect(await get.execute("alice")).toEqual(PlayerSteps.none("alice"));

		await new SeeTutorial(store).execute("alice");

		expect((await get.execute("alice")).tutorialSeen).toBe(true);
		expect((await get.execute("bob")).tutorialSeen).toBe(false);
	});

	it("can be done twice", async () => {
		const store = new InMemoryPlayerStepsStore();
		const seeTutorial = new SeeTutorial(store);
		await seeTutorial.execute("alice");
		await seeTutorial.execute("alice");
		expect((await store.find("alice")).tutorialSeen).toBe(true);
	});
});
