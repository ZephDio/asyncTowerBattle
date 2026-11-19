import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class ProjectileResources {
	static arrow: ShapedResource = {
		image: createImage("/resources/projectiles/arrow.png"),
		shape: "rectangle",
		size: {
			width: 3.5,
			height: 1.5,
		},
	};

	static bullet: ShapedResource = {
		image: createImage("/resources/projectiles/bullet.png"),
		shape: "rectangle",
		size: {
			width: 1.9,
			height: 1.5,
		},
	};

	static rocket: ShapedResource = {
		image: createImage("/resources/projectiles/rocket.png"),
		shape: "rectangle",
		size: {
			width: 2.2,
			height: 1.8,
		},
	};

	static spark: ShapedResource = {
		image: createImage("/resources/projectiles/spark.png"),
		shape: "rectangle",
		size: {
			width: 2.7,
			height: 1.2,
		},
	};

	// The blacksmith's hammer sparks: a short ember comet, much shorter than the Zapping Tower's lightning.
	static emberSpark: ShapedResource = {
		image: createImage("/resources/projectiles/ember-spark.png"),
		shape: "rectangle",
		size: {
			width: 1.2,
			height: 0.52,
		},
	};

	static spine: ShapedResource = {
		image: createImage("/resources/projectiles/spine.png"),
		shape: "rectangle",
		size: {
			width: 2,
			height: 0.9,
		},
	};

	// The drill tower's bit at the tower's scale (20px per unit), pointing right like every projectile
	static drill: ShapedResource = {
		image: createImage("/resources/projectiles/drill.png"),
		shape: "rectangle",
		size: {
			width: 2.5,
			height: 1.9,
		},
	};

	static frostSpike: ShapedResource = {
		image: createImage("/resources/projectiles/frost_spike.png"),
		shape: "rectangle",
		size: {
			width: 2.2,
			height: 1.8,
		},
	};
}
