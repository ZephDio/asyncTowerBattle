import { Cell } from "../../../shared/position";
import { ARMY_GRID_SIZES } from "../../grid/grid-sizes";
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

const round1CastleCell = () => new Cell({ x: 0, y: ARMY_GRID_SIZES.round1.height - 1 });
const round2CastleCell = () => new Cell({ x: 0, y: ARMY_GRID_SIZES.round2.height - 1 });

export class CastleFactory {
	static get defaultDwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), round1CastleCell());
	}

	static get defaultElf() {
		return new ElfCastle(new ElfCastleBlueprint({}), round1CastleCell());
	}

	static get round2Elf() {
		return new ElfCastle(new ElfCastleBlueprint({}), round2CastleCell());
	}

	static get round2Dwarf() {
		return new DwarfCastle(new DwarfCastleBlueprint({}), round2CastleCell());
	}
}
