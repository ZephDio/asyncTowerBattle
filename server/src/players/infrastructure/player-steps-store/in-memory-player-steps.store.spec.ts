import { InMemoryPlayerStepsStore } from "./in-memory-player-steps.store.js";
import { playerStepsStoreSuite } from "./player-steps.store.test-suite.js";

playerStepsStoreSuite("InMemoryPlayerStepsStore", async () => ({
	store: new InMemoryPlayerStepsStore(),
	playerIds: ["alice", "bob"],
}));
