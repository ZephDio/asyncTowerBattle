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
  }

  static bullet: ShapedResource = {
		image: createImage("/resources/projectiles/bullet.png"),
		shape: "rectangle",
		size: {
			width: 1.9,
			height: 1.5,
		},
	}

  static rocket: ShapedResource = {
		image: createImage("/resources/projectiles/rocket.png"),
		shape: "rectangle",
		size: {
			width: 2.2,
			height: 1.8,
		},
	}

  static spark: ShapedResource = {
		image: createImage("/resources/projectiles/spark.png"),
		shape: "rectangle",
		size: {
			width: 2.7,
			height: 1.2,
		},
	}

  static spine: ShapedResource = {
		image: createImage("/resources/projectiles/spine.png"),
		shape: "rectangle",
		size: {
			width: 2,
			height: 0.9,
		},
	}

  static frostSpike: ShapedResource = {
		image: createImage("/resources/projectiles/frost_spike.png"),
		shape: "rectangle",
		size: {
			width: 2.2,
			height: 1.8,
		},
	}
}