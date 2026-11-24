import { roundGridSize } from "../../opponents/domain/board-rules.js";
import type { SerializedBoard } from "../../opponents/domain/serialized-board.js";
import type { SavedGame } from "./current-game.js";

export const board = (round: number): SerializedBoard => ({
	round,
	faction: "Dwarf",
	size: roundGridSize(round),
	randomSeed: 0,
	elements: [{ kind: "castle", cell: { x: 0, y: 5 } }],
});

export const savedGame = (overrides: Partial<SavedGame> = {}): SavedGame => ({
	phase: "shop",
	life: 5,
	gold: 45,
	performance: { wins: 1, losses: 0 },
	board: board(2),
	inventory: [{ kind: "tower", type: "frost", cell: { x: 0, y: 0 } }],
	opponent: null,
	...overrides,
});
