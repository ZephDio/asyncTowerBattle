import { Trait } from "@ddd-ts/traits";
import { Cell } from "../../../position";

// A piece is written facing the player. On the opponent board it is mirrored through a point, so its footprint, its
// pattern and its image all turn by π together.
export type BoardOrientation = "normal" | "mirrored";

export const orientCell = (cell: Cell, orientation: BoardOrientation) => {
	if (orientation === "normal") return cell;
	return new Cell({ x: -cell.x || 0, y: -cell.y || 0 });
};

// Point reflection through the centre of a width × height board: the top right cell becomes the bottom left one.
export const flipCell = (cell: Cell, width: number, height: number) => {
	return new Cell({ x: width - 1 - cell.x, y: height - 1 - cell.y });
};

export const TBoardOriented = Trait((base) => {
	abstract class IBoardOriented extends base {
		orientation: BoardOrientation = "normal";
		get mirrored() {
			return this.orientation === "mirrored";
		}
	}
	return IBoardOriented;
});
