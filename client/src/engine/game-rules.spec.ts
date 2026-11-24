import { MAX_ROUNDS, isRunOver } from "./game-rules";

describe("isRunOver", () => {
	it("continues while the player has lives and rounds are left", () => {
		expect(isRunOver(5, 1)).toBe(false);
		expect(isRunOver(1, MAX_ROUNDS - 1)).toBe(false);
	});

	it("ends at the last round even with lives left", () => {
		expect(isRunOver(3, MAX_ROUNDS)).toBe(true);
	});

	it("ends when the last life is lost", () => {
		expect(isRunOver(0, 3)).toBe(true);
		expect(isRunOver(0, MAX_ROUNDS)).toBe(true);
	});
});
