import { Cell } from "../../../shared/position";
import { GridSize, armyGridSize } from "../../grid/grid-sizes";
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

// The castle sits in the bottom-left corner of the board.
const castleCell = ({ height }: GridSize) => new Cell({ x: 0, y: height - 1 });

export class CastleFactory {
	static get defaultDwarf() {
		return CastleFactory.dwarf(armyGridSize(1));
	}

	static get defaultElf() {
		return CastleFactory.elf(armyGridSize(1));
	}

	static dwarf(size: GridSize) {
		return new DwarfCastle(new DwarfCastleBlueprint({}), castleCell(size));
	}

	static elf(size: GridSize) {
		return new ElfCastle(new ElfCastleBlueprint({}), castleCell(size));
	}
}
