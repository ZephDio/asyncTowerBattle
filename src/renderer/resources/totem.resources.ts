import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class TotemResources {
	static anvil: ShapedResource = {
		size: {
			width: 6.2,
			height: 6,
		},
		image: createImage("/resources/totem/anvil.png"),
		shape: "ellipse",
	};
	static cropsfield: ShapedResource = {
		size: {
			width: 5,
			height: 4.53125,
		},
		image: createImage("/resources/totem/crops-field.png"),
		shape: "rectangle",
	};

	static obelisk: ShapedResource = {
		size: {
			width: 4,
			height: 10,
		},
		image: createImage("/resources/totem/obelisk.png"),
		shape: "rectangle",
	};
	static bakery: ShapedResource = {
		size: {
			width: 6,
			height: 6,
		},
		image: createImage("/resources/totem/bakery.png"),
		shape: "rectangle",
	};

	static brewery: ShapedResource = {
		size: {
			width: 10,
			height: 5,
		},
		image: createImage("/resources/totem/brewery.png"),
		shape: "rectangle",
	};
	static windmill: ShapedResource = {
		size: {
			width: 6.4,
			height: 6.4,
		},
		image: createImage("/resources/totem/windmill.png"),
		shape: "rectangle",
	};

	static mine: ShapedResource = {
		size: {
			width: 5,
			height: 5,
		},
		image: createImage("/resources/totem/mine.png"),
		shape: "ellipse",
	};
	static gobelinportal: ShapedResource = {
		size: {
			width: 5,
			height: 6.25,
		},
		image: createImage("/resources/totem/gobelin-portal.png"),
		shape: "ellipse",
	};
}
