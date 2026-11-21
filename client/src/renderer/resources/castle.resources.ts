import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class CastleResources {
	static elf: ShapedResource = {
		size: {
			width: 9.8,
			height: 9.8,
		},
		image: createImage("/resources/castle/elf/front-view.png"),
		shape: "rectangle",
	};
	static dwarf: ShapedResource = {
		size: {
			width: 9.8,
			height: 9.8,
		},
		image: createImage("/resources/castle/dwarf/front-view.png"),
		shape: "rectangle",
	};
}
