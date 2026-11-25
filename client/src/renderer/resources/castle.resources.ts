import { DWARF_CASTLE_LAYOUT, ELF_CASTLE_LAYOUT, STANDARD_CELL_SIZE } from "../../engine/grid/grid-scale";
import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class CastleResources {
	private static size({ width, height }: { width: number; height: number }) {
		return { width: width * STANDARD_CELL_SIZE, height: height * STANDARD_CELL_SIZE };
	}

	static elfBoardLeft: ShapedResource = {
		size: CastleResources.size(ELF_CASTLE_LAYOUT),
		image: createImage("/resources/castle/elf/board-left.png"),
		shape: "rectangle",
	};
	// Right of the board (the opponent's castle): enemies arrive in the upper row, units spawn below.
	static elfBoardRight: ShapedResource = {
		size: CastleResources.size(ELF_CASTLE_LAYOUT),
		image: createImage("/resources/castle/elf/board-right.png"),
		shape: "rectangle",
	};

	static dwarfBoardLeft: ShapedResource = {
		size: CastleResources.size(DWARF_CASTLE_LAYOUT),
		image: createImage("/resources/castle/dwarf/board-left.png"),
		shape: "rectangle",
	};
	static dwarfBoardRight: ShapedResource = {
		size: CastleResources.size(DWARF_CASTLE_LAYOUT),
		image: createImage("/resources/castle/dwarf/board-right.png"),
		shape: "rectangle",
	};

}
