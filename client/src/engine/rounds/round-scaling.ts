// What a round gives each castle and army, one entry per round (rounds past the end keep the last value). Both
// sides of a battle read the round being played, so a stored opponent board carries none of it.
export const CASTLE_LIFE_BY_ROUND = [25, 30, 35, 45, 55, 65, 80, 95, 110, 125, 140, 160, 180, 200, 225, 250] as const;

export const MAX_FOOD_BY_ROUND = [
	100, 105, 110, 115, 125, 135, 145, 160, 175, 190, 205, 220, 240, 260, 280, 300,
] as const;

const atRound = (table: readonly number[], round: number) =>
	table[Math.min(Math.max(round, 1), table.length) - 1] as number;

export const castleLife = (round: number) => atRound(CASTLE_LIFE_BY_ROUND, round);

export const maxFood = (round: number) => atRound(MAX_FOOD_BY_ROUND, round);
