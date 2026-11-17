import { Rarity } from "../../../shared/traits/engine/rarity";
import { FLAT_ODDS_ROUND, rarityOdds } from "./rarity-odds";

const total = (round: number) => Object.values(rarityOdds(round)).reduce((sum, odds) => sum + odds, 0);

describe("rarityOdds", () => {
	it("offers 90% commons and 10% uncommons on the first round", () => {
		expect(rarityOdds(1)).toEqual({
			[Rarity.Common]: 90,
			[Rarity.Uncommon]: 10,
			[Rarity.Rare]: 0,
			[Rarity.Epic]: 0,
			[Rarity.Legendary]: 0,
		});
	});

	it("gives every rarity 20% from the flat odds round on", () => {
		expect(FLAT_ODDS_ROUND).toBe(12);
		for (const round of [FLAT_ODDS_ROUND, FLAT_ODDS_ROUND + 5]) {
			for (const odds of Object.values(rarityOdds(round))) expect(odds).toBe(20);
		}
	});

	it("sums to 100% every round", () => {
		for (let round = 1; round <= FLAT_ODDS_ROUND; round++) expect(total(round)).toBe(100);
	});

	it("never lowers the commons' odds nor the legendaries' from one round to the next", () => {
		for (let round = 1; round < FLAT_ODDS_ROUND; round++) {
			expect(rarityOdds(round + 1)[Rarity.Common]).toBeLessThanOrEqual(rarityOdds(round)[Rarity.Common]);
			expect(rarityOdds(round + 1)[Rarity.Legendary]).toBeGreaterThanOrEqual(rarityOdds(round)[Rarity.Legendary]);
		}
	});
});
