import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid";
import { createImage } from "../../shared/image";
import { GRASS_VARIANTS, GrassKind } from "../../engine/grid/grass-layout";
import { ShapedResource } from "./tower.resources";

const grassVariants = (kind: GrassKind) =>
	Array.from({ length: GRASS_VARIANTS[kind] }, (_, i) => createImage(`/resources/environment/grass/${kind}-${i}.png`));

const ROCK_SCALE = 1.15;

export class EnvironmentResources {
	// The grass patches of the grids, drawn by scripts/generate-grass.py. The game lays them out in grass-layout.ts.
	static grass: Record<GrassKind, HTMLImageElement[]> = {
		small: grassVariants("small"),
		wide: grassVariants("wide"),
		tall: grassVariants("tall"),
		big: grassVariants("big"),
	};

	static rock: ShapedResource = {
		image: createImage("/resources/environment/rock.png"),
		shape: "ellipse",
		// A rocky outcrop that fills its cell and rises a little above and beyond it
		size: {
			width: STANDARD_CELL_SIZE * ROCK_SCALE,
			height: STANDARD_CELL_SIZE * ROCK_SCALE,
		},
	};
	static forest: ShapedResource = {
		image: createImage("/resources/environment/forest.png"),
		shape: "ellipse",
		size: {
			width: STANDARD_CELL_SIZE,
			height: STANDARD_CELL_SIZE,
		},
	};
}
