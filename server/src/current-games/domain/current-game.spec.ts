import { PlayerBoardRuleError } from "../../opponents/domain/opponent-errors.js";
import { CurrentGame, type SavedGame } from "./current-game.js";
import { board, savedGame } from "./current-game-fixtures.js";
import { CurrentGameRuleError } from "./current-game-errors.js";

const battle = (overrides: Partial<SavedGame> = {}) =>
	savedGame({ phase: "battle", opponent: { board: { ...board(2), randomSeed: 7 }, playerName: "Bob" }, ...overrides });

const thrown = (game: SavedGame): unknown => {
	try {
		new CurrentGame({ playerId: "alice", game });
	} catch (error) {
		return error;
	}
	return undefined;
};

describe("CurrentGame", () => {
	it("accepts a game in its shop phase and a game in its battle phase", () => {
		expect(new CurrentGame({ playerId: "alice", game: savedGame() }).round).toBe(2);
		expect(new CurrentGame({ playerId: "alice", game: battle() }).game.opponent?.playerName).toBe("Bob");
	});

	it.each([
		["a life under one", savedGame({ life: 0 })],
		["a fractional life", savedGame({ life: 1.5 })],
		["a negative run seed", savedGame({ runSeed: -1 })],
		["a run seed past the range", savedGame({ runSeed: 2 ** 31 })],
		["negative gold", savedGame({ gold: -1 })],
		["negative wins", savedGame({ performance: { wins: -1, losses: 0 } })],
		["a battle without its opponent", savedGame({ phase: "battle" })],
		["a shop with an opponent", savedGame({ opponent: battle().opponent })],
		["an opponent of another round", battle({ opponent: { board: board(3), playerName: "Bob" } })],
	])("refuses %s", (_name, game) => {
		expect(thrown(game)).toBeInstanceOf(CurrentGameRuleError);
	});

	it("applies the board rules to both boards", () => {
		const wrongSize = { ...board(2), size: { width: 1, height: 1 } };

		expect(thrown(savedGame({ board: { ...board(2), round: 0 } }))).toBeInstanceOf(PlayerBoardRuleError);
		expect(thrown(battle({ opponent: { board: wrongSize, playerName: "Bob" } }))).toBeInstanceOf(PlayerBoardRuleError);
	});
});
