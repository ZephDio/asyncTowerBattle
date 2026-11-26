import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class BarrackResources {
	static basic: ShapedResource = {
		// 110x143 image, one cell wide
		size: {
			width: 4.9,
			height: 6.37,
		},
		image: createImage("/resources/barracks/barracks.png"),
		shape: "rectangle",
	};

	static rush: ShapedResource = {
		// 220x143 image, two cells wide, same scale and ground row as the basic barracks
		size: {
			width: 9.8,
			height: 6.37,
		},
		image: createImage("/resources/barracks/rush-barracks.png"),
		shape: "rectangle",
	};

	static wave: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/barracks/red.png"),
		shape: "rectangle",
	};

	static veterant: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/barracks/yellow.png"),
		shape: "rectangle",
	};
}
