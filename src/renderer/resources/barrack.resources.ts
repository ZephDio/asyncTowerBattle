import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class BarrackResources {
  static basic: ShapedResource = {
        size: {
          width: 5,
          height: 8,
        },
        image: createImage("/resources/house/house_blue.png"),
        shape: "rectangle",
      };

  static wave: ShapedResource = {
			size: {
				width: 5,
				height: 8,
			},
			image: createImage("/resources/house/house_red.png"),
			shape: "rectangle",
		};

  static veterant: ShapedResource = {
			size: {
				width: 5,
				height: 8,
			},
			image: createImage("/resources/house/house_yellow.png"),
			shape: "rectangle",
		};
}