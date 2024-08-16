import { Cell } from "../../../shared/position";
import { CastleBlueprintFixtures } from "../blueprint/castle-fixtures";
import { DwarfCastleBlueprint } from "../blueprint/dwarf-castle-blueprint";
import { ElfCastleBlueprint } from "../blueprint/elf-castle-blueprint";
import { DwarfCastle } from "./implem/dwarf-castle";
import { ElfCastle } from "./implem/elf-castle";

export class CastleFixture {
	static get allied() {
		return new ElfCastle(CastleBlueprintFixtures.allied, new Cell({ x: 0, y: 5 }));
	}
	static get enemy() {
		return new ElfCastle(CastleBlueprintFixtures.enemy, new Cell({ x: 0, y: 5 }));
	}
}

export class CastleFactory {
	static get defaultDwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), new Cell({ x: 0, y: 4 }));
	}

	static get defaultElf() {
		return new ElfCastle(new ElfCastleBlueprint({}), new Cell({ x: 0, y: 4 }));
	}

	static get round2Elf() {
		return new ElfCastle(new ElfCastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}

	static get round2Dwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), new Cell({ x: 0, y: 5 }));
	}
}
