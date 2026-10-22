import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class CastleResources {
	static elf: ShapedResource = {
		size: {
			width: 7,
			height: 7,
		},
		image: {
			frontView: createImage("/resources/castle/elf/front-view.png"),
			backView: createImage("/resources/castle/elf/back-view.png"),
			leftView: createImage("/resources/castle/elf/back-view.png"),
			rightView: createImage("/resources/castle/elf/front-view.png"),
		},
		shape: "rectangle",
	};
	static dwarf: ShapedResource = {
		size: {
			width: 7,
			height: 7,
		},
		image: {
			frontView: createImage("/resources/castle/dwarf/front-view.png"),
			backView: createImage("/resources/castle/dwarf/back-view.png"),
			leftView: createImage("/resources/castle/dwarf/back-view.png"),
			rightView: createImage("/resources/castle/dwarf/front-view.png"),
		},
		shape: "rectangle",
	};
}
