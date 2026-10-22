import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class TotemResources {
	static anvil: ShapedResource = {
		size: {
			width: 6.2,
			height: 6,
		},
		image: {
			frontView: createImage("/resources/totem/anvil/front-view.png"),
			backView: createImage("/resources/totem/anvil/back-view.png"),
			leftView: createImage("/resources/totem/anvil/left-view.png"),
			rightView: createImage("/resources/totem/anvil/right-view.png"),
		},
		shape: "ellipse",
	};
	static cropsfield: ShapedResource = {
		size: {
			width: 5,
			height: 5,
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
		image: {
			frontView: createImage("/resources/totem/bakery/front-view.png"),
			backView: createImage("/resources/totem/bakery/back-view.png"),
			leftView: createImage("/resources/totem/bakery/left-view.png"),
			rightView: createImage("/resources/totem/bakery/right-view.png"),
		},
		shape: "rectangle",
	};

	static brewery: ShapedResource = {
		size: {
			width: 10,
			height: 5,
		},
		image: {
			frontView: createImage("/resources/totem/brewery/front-view.png"),
			backView: createImage("/resources/totem/brewery/back-view.png"),
			leftView: createImage("/resources/totem/brewery/left-view.png"),
			rightView: createImage("/resources/totem/brewery/right-view.png"),
		},
		shape: "rectangle",
	};
	static windmill: ShapedResource = {
		size: {
			width: 6.4,
			height: 6.4,
		},
		image: {
			frontView: createImage("/resources/totem/windmill/front-view.png"),
			backView: createImage("/resources/totem/windmill/back-view.png"),
			leftView: createImage("/resources/totem/windmill/left-view.png"),
			rightView: createImage("/resources/totem/windmill/right-view.png"),
		},
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
			height: 5,
		},
		image: createImage("/resources/totem/gobelin-portal.png"),
		shape: "ellipse",
	};
}
