import { Cell } from "../../../shared/position";
import { CastleBlueprintFixtures } from "../blueprint/castle-fixtures";
import { DwarfCastleBlueprint } from "../blueprint/dwarf-castle-blueprint";
import { HumanCastleBlueprint } from "../blueprint/human-castle-blueprint";
import { DwarfCastle } from "./implem/dwarf-castle";
import { HumanCastle } from "./implem/human-castle";

export class CastleFixture {
	static get allied() {
		return new HumanCastle(CastleBlueprintFixtures.allied,new Cell({ x : 0 , y : 5}));
	}
	static get enemy() {
		return new HumanCastle(CastleBlueprintFixtures.enemy,new Cell({ x : 0 , y : 5}));
	}
}



export class CastleFactory {
	static get defaultDwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), new Cell({ x: 0, y: 4 }));
	}

	static get defaultHuman() {
		return new HumanCastle(new HumanCastleBlueprint({}), new Cell({ x: 0, y: 4 }));
	}

	static get round2Human() {
		return new HumanCastle(new HumanCastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}

	static get round2Dwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}
}
