import { createImage } from "../../shared/image";
import { ShapedResource } from "./tower.resources";

export class UnitResources {
  static elf: ShapedResource = {
    size: {
      width: 3,
      height: 3,
    },
    shape: "ellipse",
    image: createImage("/resources/units/elf.png"),
  };

  static choupisson: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/choupisson.png"),
		shape: "ellipse",
	};

  static dragon: ShapedResource = {
		size: {
			width: 3.3,
			height: 3.3,
		},
		image: createImage("/resources/units/dragon.png"),
		shape: "ellipse",
	}

  static priest: ShapedResource = {
		size: {
			width: 2.5,
			height: 2.5,
		},
		image: createImage("/resources/units/priest.png"),
		shape: "ellipse",
	}

  static berseker: ShapedResource = {
		size: {
			width: 3,
			height: 4,
		},
		image: createImage("/resources/units/berseker.png"),
		shape: "ellipse",
	}
  static ent: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/ent.png"),
		shape: "ellipse",
	}

  static gobelin: ShapedResource = {
		size: {
			width: 2.8,
			height: 2.8,
		},
		image: createImage("/resources/units/gobelin.png"),
		shape: "ellipse",
	}

  static dwarf : ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/dwarf.png"),
		shape: "rectangle",
	}

  static fox : ShapedResource = {
		size: {
			width: 3,
			height: 2,
		},
		image: createImage("/resources/units/fox.png"),
		shape: "ellipse",
	}

  static brewmaster: ShapedResource = {
    size: {
      width: 3,
      height: 3,
    },
    image: createImage("/resources/units/gobelin-archer.png"),
    shape: "ellipse",
  }
}