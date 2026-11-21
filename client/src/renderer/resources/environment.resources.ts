import { STANDARD_CELL_SIZE } from "../../engine/grid/tgrid";
import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

const ROCK_SCALE = 1.15;

export class EnvironmentResources {
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
