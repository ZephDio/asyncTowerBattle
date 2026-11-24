import { currentGameStoreSuite } from "./current-game.store.test-suite.js";
import { InMemoryCurrentGameStore } from "./in-memory-current-game.store.js";

currentGameStoreSuite("InMemoryCurrentGameStore", {
	createStore: () => new InMemoryCurrentGameStore(),
	addPlayer: async () => crypto.randomUUID(),
	clear: async () => {},
});
