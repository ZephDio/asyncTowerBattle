// An opponent board as plain JSON, the way the opponent server stores and sends it. Cells are in the board's own
// frame (y up, castle in the bottom-left corner), before any battle mirroring.
// Keep in sync with server/src/opponents/domain/serialized-board.ts.

export type SerializedCell = { x: number; y: number };

export type SerializedFaction = "Dwarf" | "Elf";
export type SerializedTowerType = "blacksmith" | "drill" | "frost" | "windmill-turret" | "witch-house" | "zapping";
export type SerializedTotemType =
	| "anvil"
	| "bakery"
	| "bosquet"
	| "brewery"
	| "crops-field"
	| "gobelin-portal"
	| "mine"
	| "red-obelisk"
	| "powder-magazine"
	| "windmill";
export type SerializedBarrackType = "basic" | "rush" | "veterant" | "wave";
export type SerializedUnitType =
	| "brewmaster"
	| "choupisson"
	| "dragon"
	| "ent"
	| "fox"
	| "go-goat"
	| "paradise-bird"
	| "white-stag";
export type SerializedTrapType = "slowing" | "stun";
export type SerializedEnvironmentType = "forest" | "rock";

export type SerializedElement =
	| { kind: "castle"; cell: SerializedCell }
	| { kind: "tower"; type: SerializedTowerType; cell: SerializedCell }
	| { kind: "totem"; type: SerializedTotemType; cell: SerializedCell }
	| { kind: "barrack"; type: SerializedBarrackType; cell: SerializedCell; unit: SerializedUnitType | null }
	| {
			kind: "path";
			cell: SerializedCell;
			trap: SerializedTrapType | null;
			// The pair of directions a junction tile was set to, see PathTile.connectionChoice.
			connectionChoice: SerializedCell[] | null;
	  }
	| { kind: "environment"; type: SerializedEnvironmentType; cell: SerializedCell };

export type SerializedBoard = {
	round: number;
	// Picks the castle and the army's default unit.
	faction: SerializedFaction;
	size: { width: number; height: number };
	randomSeed: number;
	elements: SerializedElement[];
};
