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

	// Two cells wide. The image is a placeholder copy of barracks.png until new-barrack-art draws it and sets the size.
	static rush: ShapedResource = {
		size: {
			width: 9.8,
			height: 6.37,
		},
		image: createImage("/resources/house/rush-barracks.png"),
		shape: "rectangle",
	};
}
