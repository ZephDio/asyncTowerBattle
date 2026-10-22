import { Subtrait } from "@ddd-ts/traits";
import { Tagged } from "../tagged.js";

export const BUILDING_TAGS = ["Tower", "Barrack", "Totem", "Tile", "Trap", "Castle"] as const;
export type BuildingTag = (typeof BUILDING_TAGS)[number];

export const TowerTag = Subtrait([Tagged], (base, Props) => {
	abstract class TTowerTag extends base {
		towerTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Tower");
		}
	}
	return TTowerTag;
});

export const BarrackTag = Subtrait([Tagged], (base, Props) => {
	abstract class TBarrackTag extends base {
		barrackTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Barrack");
		}
	}
	return TBarrackTag;
});

export const TotemTag = Subtrait([Tagged], (base, Props) => {
	abstract class TTotemTag extends base {
		totemTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Totem");
		}
	}
	return TTotemTag;
});

export const FoodTag = Subtrait([Tagged], (base, Props) => {
	abstract class TFoodTag extends base {
		foodTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Food");
		}
	}
	return TFoodTag;
});

export const TileTag = Subtrait([Tagged], (base, Props) => {
	abstract class TTileTag extends base {
		tileTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Tile");
		}
	}
	return TTileTag;
});

export const TrapTag = Subtrait([Tagged], (base, Props) => {
	abstract class TTrapTag extends base {
		trapTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Trap");
		}
	}
	return TTrapTag;
});

export const CastleTag = Subtrait([Tagged], (base, Props) => {
	abstract class TCastleTag extends base {
		castleTag = true;
		constructor(props: typeof Props) {
			super(props);
			this.tags.push("Castle");
		}
	}
	return TCastleTag;
});
