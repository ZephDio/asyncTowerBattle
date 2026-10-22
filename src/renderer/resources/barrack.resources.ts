import { ShapedResource, createViews } from "./tower.resources";

export class BarrackResources {
	static basic: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/house/blue"),
		shape: "rectangle",
	};

	static wave: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/house/red"),
		shape: "rectangle",
	};

	static veterant: ShapedResource = {
		size: {
			width: 5,
			height: 8,
		},
		image: createViews("/resources/house/yellow"),
		shape: "rectangle",
	};
}
