import { Rarity } from "../../../../../shared/traits/engine/rarity";

// The Rush Barrack's tuning, in one place. foodPerSummon is still provisional.
export const RUSH_BARRACK = {
	rarity: Rarity.Common,
	price: 15,
	shopShare: 10,
	foodPerSummon: 3,
	castSpeed: 1.2,
	// The food each unit it summons eats on top of its own upkeep, every 2 seconds while it lives (Ravenous).
	extraFoodPerUnit: 1,
} as const;
