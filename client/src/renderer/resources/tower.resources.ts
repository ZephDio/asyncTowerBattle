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
	// Visual only: reserved for a future two-cell blacksmith tower.
	static blacksmith: ShapedResource = {
		size: { width: 9.8, height: 6.023 },
		image: createImage("/resources/towers/blacksmith.png"),
		shape: "rectangle",
	};

	// Visual for a future windmill turret; no tower currently uses this resource.
	static windmillTurret: ShapedResource = {
		size: {
			width: 5.2,
			height: 7.1,
		},
		image: createImage("/resources/towers/windmill-turret.png"),
		shape: "rectangle",
	};

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
			width: 4.71,
			height: 9.616,
		},
		image: createImage("/resources/towers/poison-tower.png"),
		shape: "rectangle",
	};

	// An L drawn over its 2x2 cell box, one 98px quadrant per cell, the bottom left one left empty
	static drill: ShapedResource = {
		size: {
			width: 9.8,
			height: 9.8,
		},
		image: createImage("/resources/towers/drill-tower.png"),
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
