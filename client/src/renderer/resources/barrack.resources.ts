import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class BarrackResources {
	static basic: ShapedResource = {
		// 110x143 image, one cell wide
		size: {
			width: 4.9,
			height: 6.37,
		},
		image: createImage("/resources/house/barracks.png"),
		shape: "rectangle",
	};

	static wave: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/house/red.png"),
		shape: "rectangle",
	};

	static veterant: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/house/yellow.png"),
		shape: "rectangle",
	};
}
