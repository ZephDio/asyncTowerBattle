import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid";
import { createImage } from "../../shared/image";
import { Resource } from "./tower.resources";

// `straight` connects up and down, `turn` connects up and right; they are rotated to match the path.
export type PathResource = Resource & {
	straight: HTMLImageElement;
	turn: HTMLImageElement;
};

const pathResource = (name: string): PathResource => {
	const straight = createImage(`/resources/path/${name}-straight.png`);
	return {
		size: {
			width: STANDARD_CELL_SIZE,
			height: STANDARD_CELL_SIZE,
		},
		// A lone tile, as in the shop or in hand, is a straight piece.
		image: straight,
		straight,
		turn: createImage(`/resources/path/${name}-turn.png`),
	};
};

export class PathResources {
	static normal = pathResource("normal");
	static slowing = pathResource("slowing");
	static trap = pathResource("trap");
}
