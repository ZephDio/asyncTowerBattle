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
import { Buyable } from "../shop/retail/buyable";

// A running game as the server keeps it for the player to continue, as plain JSON. A game saved in its shop phase
// reopens that shop, one saved in its battle phase reopens the battle against the same opponent.
// Keep in sync with server/src/current-games/domain/current-game.ts.
export type SavedGame = {
	phase: "shop" | "battle";
	// The seed of the run, see Game.runSeed.
	runSeed: number;
	life: number;
	gold: number;
	performance: GamePerformance;
	// The player's army grid, of the round being played. Its random seed means nothing.
	board: SerializedBoard;
	inventory: SerializedInventoryItem[];
	// The shop offers the player reserved, each in its slot (the item's cell), for the next shop to keep. A game saved
	// before reservations has none.
	reservedOffers?: SavedOffer[];
	opponent: { board: SerializedBoard; playerName: string } | null;
};

export type SavedOffer = { item: SerializedInventoryItem; price: number };

export type GameSnapshot = {
	phase: SavedGame["phase"];
	army: Army;
	runSeed: number;
	round: number;
	life: number;
	performance: GamePerformance;
	reservedOffers?: Buyable[];
	// The opponent of a battle.
	opponent?: Opponent;
};

export const serializeGame = ({
	phase,
	army,
	runSeed,
	round,
	life,
	performance,
	reservedOffers = [],
	opponent,
}: GameSnapshot): SavedGame => ({
	phase,
	runSeed,
	life,
	gold: army.goldEconomy.golds.amount,
	performance: { ...performance },
	board: serializeBoard(army, round, 0),
	inventory: [...new Set(army.inventory.getRecruits())].map(serializeInventoryItem),
	reservedOffers: reservedOffers.map((offer) => ({ item: serializeInventoryItem(offer.entity), price: offer.price })),
	opponent: opponent
		? { board: serializeBoard(opponent.army, round, opponent.randomSeed), playerName: opponent.playerName }
		: null,
});

export type RestoredGame = {
	faction: Faction;
	army: Army;
	runSeed: number;
	round: number;
	life: number;
	performance: GamePerformance;
	phase: SavedGame["phase"];
	reservedOffers: Buyable[];
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
		runSeed: saved.runSeed,
		round: saved.board.round,
		life: saved.life,
		performance: { ...saved.performance },
		phase: saved.phase,
		reservedOffers: (saved.reservedOffers ?? []).map(({ item, price }) =>
			Buyable.from(deserializeInventoryItem(item), price),
		),
		opponent,
	};
};
