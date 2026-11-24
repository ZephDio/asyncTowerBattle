import { Army } from "../army/army";
import { Faction } from "../menu/main-menu";
import {
	deserializeBoard,
	deserializeInventoryItem,
	serializeBoard,
	serializeInventoryItem,
} from "../match-maker/board-serializer";
import { GamePerformance, Opponent } from "../match-maker/match-maker";
import { SerializedBoard, SerializedInventoryItem } from "../match-maker/serialized-board";

// A running game as the server keeps it for the player to continue, as plain JSON. A game saved in its shop phase
// reopens that shop, one saved in its battle phase reopens the battle against the same opponent.
// Keep in sync with server/src/current-games/domain/current-game.ts.
export type SavedGame = {
	phase: "shop" | "battle";
	life: number;
	gold: number;
	performance: GamePerformance;
	// The player's army grid, of the round being played. Its random seed means nothing.
	board: SerializedBoard;
	inventory: SerializedInventoryItem[];
	opponent: { board: SerializedBoard; playerName: string } | null;
};

export type GameSnapshot = {
	phase: SavedGame["phase"];
	army: Army;
	round: number;
	life: number;
	performance: GamePerformance;
	// The opponent of a battle.
	opponent?: Opponent;
};

export const serializeGame = ({ phase, army, round, life, performance, opponent }: GameSnapshot): SavedGame => ({
	phase,
	life,
	gold: army.goldEconomy.golds.amount,
	performance: { ...performance },
	board: serializeBoard(army, round, 0),
	inventory: [...new Set(army.inventory.getRecruits())].map(serializeInventoryItem),
	opponent: opponent
		? { board: serializeBoard(opponent.army, round, opponent.randomSeed), playerName: opponent.playerName }
		: null,
});

export type RestoredGame = {
	faction: Faction;
	army: Army;
	round: number;
	life: number;
	performance: GamePerformance;
	phase: SavedGame["phase"];
	opponent: Opponent | null;
};

export const restoreGame = (saved: SavedGame): RestoredGame => {
	const { army } = deserializeBoard(saved.board);
	army.grid.getRecruits().forEach((recruit) => army.join(recruit));
	saved.inventory.forEach((item) => army.addToInventory(deserializeInventoryItem(item)));
	army.goldEconomy.golds.amount = saved.gold;
	const opponent = saved.opponent && {
		...deserializeBoard(saved.opponent.board),
		playerName: saved.opponent.playerName,
	};
	return {
		faction: saved.board.faction === "Elf" ? Faction.Elf : Faction.Dwarf,
		army,
		round: saved.board.round,
		life: saved.life,
		performance: { ...saved.performance },
		phase: saved.phase,
		opponent,
	};
};
