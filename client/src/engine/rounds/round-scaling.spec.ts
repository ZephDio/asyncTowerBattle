import "../match-maker/board-serializer";
import { deserializeBoard, serializeBoard } from "../match-maker/board-serializer";
import { ArmyFactory } from "../army/army-fixtures";
import { Faction } from "../menu/main-menu";
import { MAX_ROUNDS } from "../game-rules";
import { CASTLE_LIFE_BY_ROUND, MAX_FOOD_BY_ROUND, castleLife, maxFood } from "./round-scaling";

describe("round scaling", () => {
	it("has one value per round, rising from 25 life and 100 food to 250 life and 300 food", () => {
		expect(CASTLE_LIFE_BY_ROUND).toHaveLength(MAX_ROUNDS);
		expect(MAX_FOOD_BY_ROUND).toHaveLength(MAX_ROUNDS);
		expect([castleLife(1), castleLife(2), castleLife(MAX_ROUNDS)]).toEqual([25, 30, 250]);
		expect([maxFood(1), maxFood(2), maxFood(MAX_ROUNDS)]).toEqual([100, 115, 300]);
		for (let round = 2; round <= MAX_ROUNDS; round++) {
			expect(castleLife(round)).toBeGreaterThan(castleLife(round - 1));
			expect(maxFood(round)).toBeGreaterThan(maxFood(round - 1));
		}
	});

	it("keeps the last value past the last round", () => {
		expect(castleLife(MAX_ROUNDS + 3)).toBe(250);
		expect(maxFood(MAX_ROUNDS + 3)).toBe(300);
	});

	it.each([Faction.Elf, Faction.Dwarf])("gives the %s army the life and food of the round", (faction) => {
		const army = ArmyFactory.default(faction);
		expect([army.castle.maxHealth, army.foodEconomy.maxFood]).toEqual([25, 100]);

		army.setRound(MAX_ROUNDS);

		expect([army.castle.maxHealth, army.foodEconomy.maxFood]).toEqual([250, 300]);
		expect(army.foodEconomy.toBattle(() => ({ clock: 0 })).food).toBe(300);
	});

	it("scales a stored opponent board by the round it is played at", () => {
		const stored = serializeBoard(ArmyFactory.default(Faction.Dwarf), 1, 1);
		const opponent = deserializeBoard(stored).army;

		opponent.setRound(8);

		expect([opponent.castle.maxHealth, opponent.foodEconomy.maxFood]).toEqual([95, 195]);
	});
});
