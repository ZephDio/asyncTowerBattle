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

// The tiles at the locked ends of the path: stone bricks on the up arm, which leads to the enemy half or into the
// castle, fading into dirt. They are drawn unrotated, so there is a turn image for each side the path can leave on.
export type LockedPathResource = {
	straight: HTMLImageElement;
	turnLeft: HTMLImageElement;
	turnRight: HTMLImageElement;
};

const lockedPathResource = (name: string): LockedPathResource => ({
	straight: createImage(`/resources/path/${name}-straight.png`),
	turnLeft: createImage(`/resources/path/${name}-turn-left.png`),
	turnRight: createImage(`/resources/path/${name}-turn-right.png`),
});

// With a painted arrow showing where the enemy units come in.
export const DoorPathResources = lockedPathResource("door");
export const CastleEntryPathResources = lockedPathResource("castle-entry");

export class PathResources {
	static normal = pathResource("normal");
	static slowing = pathResource("slowing");
	static trap = pathResource("trap");
}
