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
	// Visual of the windmill turret, which replaces the green tower (same stats, same "green" serialized key).
	static windmillTurret: ShapedResource = {
		size: {
			width: 5.2,
			height: 7.1,
		},
		image: createImage("/resources/towers/windmill-turret.png"),
		shape: "rectangle",
	};

	// A horizontal 2x1 piece: two cells wide, drawn taller than its footprint
	static blacksmithTower: ShapedResource = {
		size: { width: 9.8, height: (9.8 * 172) / 232 },
		image: createImage("/resources/towers/blacksmith-tower.png"),
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
