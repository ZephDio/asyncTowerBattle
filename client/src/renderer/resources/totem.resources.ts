import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class TotemResources {
	static anvil: ShapedResource = {
		size: {
			width: 6.2,
			height: 5.0375,
		},
		image: createImage("/resources/totem/anvil.png"),
		shape: "ellipse",
	};
	static cropsfield: ShapedResource = {
		size: {
			width: 4.9,
			height: 4.098,
		},
		image: createImage("/resources/totem/crops-field.png"),
		shape: "rectangle",
	};

	static obelisk: ShapedResource = {
		size: {
			width: 4.808,
			height: 9.911,
		},
		image: createImage("/resources/totem/obelisk.png"),
		shape: "rectangle",
	};
	static bakery: ShapedResource = {
		size: {
			width: 4.9,
			height: 6.57,
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
			width: 5.2,
			height: 6.35,
		},
		image: createImage("/resources/totem/windmill.png"),
		shape: "rectangle",
	};

	static powderMagazine: ShapedResource = {
		size: {
			width: 4.9,
			height: 6.2,
		},
		image: createImage("/resources/totem/powder-magazine.png"),
		shape: "rectangle",
	};

	static mine: ShapedResource = {
		size: {
			width: 4.9,
			height: 4.9,
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

	static cornField: ShapedResource = {
		size: {
			width: 4.9,
			height: 4.232,
		},
		image: createImage("/resources/totem/corn-field.png"),
		shape: "rectangle",
	};

	static stonemason: ShapedResource = {
		size: {
			width: 5.004,
			height: 8.388,
		},
		image: createImage("/resources/totem/stonemason.png"),
		shape: "rectangle",
	};

	static bosquet: ShapedResource = {
		size: {
			width: 4.9,
			height: 5.075,
		},
		image: createImage("/resources/totem/bosquet.png"),
		shape: "rectangle",
	};
}
