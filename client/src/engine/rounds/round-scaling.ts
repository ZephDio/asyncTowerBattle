// What a round gives each castle and army, one entry per round (rounds past the end keep the last value). Both
// sides of a battle read the round being played, so a stored opponent board carries none of it.
export const CASTLE_LIFE_BY_ROUND = [20, 30, 35, 45, 60, 70, 80, 95, 110, 125, 140, 160, 180, 200, 225, 250] as const;

export const MAX_FOOD_BY_ROUND = [
	100, 115, 125, 140, 155, 165, 180, 195, 205, 220, 235, 245, 260, 275, 285, 300,
] as const;

const atRound = (table: readonly number[], round: number) =>
	table[Math.min(Math.max(round, 1), table.length) - 1] as number;

export const castleLife = (round: number) => atRound(CASTLE_LIFE_BY_ROUND, round);

export const maxFood = (round: number) => atRound(MAX_FOOD_BY_ROUND, round);
