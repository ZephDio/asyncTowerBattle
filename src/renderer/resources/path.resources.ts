import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid";
import { createImage } from "../../shared/image";
import { Resource } from "./tower.resources";

// `image` is the full tile, used in the shop and when the tile is not on the path or is an end or junction.
// `straight` connects up and down, `turn` connects up and right; they are rotated to match the path.
export type PathResource = Resource & {
	image: HTMLImageElement;
	straight: HTMLImageElement;
	turn: HTMLImageElement;
};

const pathResource = (name: string): PathResource => ({
	size: {
		width: STANDARD_CELL_SIZE,
		height: STANDARD_CELL_SIZE,
	},
	image: createImage(`/resources/path/${name}.png`),
	straight: createImage(`/resources/path/${name}-straight.png`),
	turn: createImage(`/resources/path/${name}-turn.png`),
});

export class PathResources {
	static normal = pathResource("normal");
	static slowing = pathResource("slowing");
	static trap = pathResource("trap");
}
