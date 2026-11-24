// BattleRandomSeed works modulo 2**31.
export const SEED_RANGE = 0x80000000;

// A fresh seed for a run, drawn when the player presses Start Game.
export const newRunSeed = () => Math.floor(Math.random() * SEED_RANGE);

const hash = (text: string) => {
	let h = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
};

// A generator of numbers in [0, 1) that only depends on the run's seed and the keys, so the same step of the same run
// (the offers of a round's shop, the trees of a round) always draws the same numbers, whenever and however many times
// the game is reopened. Each step names itself with its keys, so no step's draws shift another's.
export const runRandom = (runSeed: number, ...keys: (string | number)[]): (() => number) => {
	let state = hash(`${runSeed}:${keys.join(":")}`);
	// mulberry32
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

// A seed of [0, 2**31) derived from the run's seed, such as the one of the battles fought against the player's board.
export const deriveSeed = (runSeed: number, ...keys: (string | number)[]) =>
	Math.floor(runRandom(runSeed, ...keys)() * SEED_RANGE);
