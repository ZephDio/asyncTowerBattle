import { createImage } from "../../shared/image";
import { Size } from "../../shared/size";

export type ShapedResource = {
	size: Size;
	image: HTMLImageElement;
	shape: string;
};

export type Resource = {
	size: Size;
	image: HTMLImageElement;
};

export class TowerResources {
	static blue: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/towers/blue.png"),
		shape: "ellipse",
	};

	static frost: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/towers/frost.png"),
		shape: "ellipse",
	};

	static green: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/towers/green.png"),
		shape: "rectangle",
	};

	static witchHouse: ShapedResource = {
		size: {
			width: 5,
			height: 10,
		},
		image: createImage("/resources/towers/poison-tower.png"),
		shape: "rectangle",
	};

	static purple: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createImage("/resources/towers/purple.png"),
		shape: "rectangle",
	};
}
