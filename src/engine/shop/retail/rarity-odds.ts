import { Rarity } from "../../../shared/traits/engine/rarity";

export type RarityOdds = Record<Rarity, number>;

// Chance, in percent, that a shop slot offers each rarity, per round. Taken from Backpack Battles' shop table
// (https://backpackbattles.wiki.gg/wiki/Rarity), its common / rare / epic / legendary / godly mapped onto our five
// rarities, its unique items left out. Each rarity comes in a wave: it grows, peaks above its final share and settles,
// the lower ones first, until every rarity has the same chance from FLAT_ODDS_ROUND on.
const ODDS_PER_ROUND: [common: number, uncommon: number, rare: number, epic: number, legendary: number][] = [
	[90, 10, 0, 0, 0],
	[84, 15, 1, 0, 0],
	[75, 20, 5, 0, 0],
	[64, 25, 10, 1, 0],
	[45, 35, 15, 5, 0],
	[29, 40, 20, 10, 1],
	[20, 35, 25, 15, 5],
	[20, 30, 25, 15, 10],
	[20, 28, 25, 15, 12],
	[20, 25, 25, 15, 15],
	[20, 23, 23, 17, 17],
	[20, 20, 20, 20, 20],
];
export const FLAT_ODDS_ROUND = ODDS_PER_ROUND.length;

export function rarityOdds(round: number): RarityOdds {
	const [common, uncommon, rare, epic, legendary] = ODDS_PER_ROUND[Math.min(Math.max(round, 1), FLAT_ODDS_ROUND) - 1]!;
	return {
		[Rarity.Common]: common,
		[Rarity.Uncommon]: uncommon,
		[Rarity.Rare]: rare,
		[Rarity.Epic]: epic,
		[Rarity.Legendary]: legendary,
	};
}
