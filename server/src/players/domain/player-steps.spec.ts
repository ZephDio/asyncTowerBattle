import { PlayerSteps } from "./player-steps.js";

describe("PlayerSteps", () => {
	it("starts with no step done", () => {
		expect(PlayerSteps.none("alice").tutorialSeen).toBe(false);
	});

	it("marks the tutorial seen in a new instance", () => {
		const none = PlayerSteps.none("alice");
		const seen = none.withTutorialSeen();
		expect(seen.tutorialSeen).toBe(true);
		expect(seen.playerId).toBe("alice");
		expect(none.tutorialSeen).toBe(false);
	});
});
