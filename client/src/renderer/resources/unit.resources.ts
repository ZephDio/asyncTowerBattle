import { createImage } from "../../shared/image";
import { SpriteSheet } from "../../shared/sprite-sheet";
import { ShapedResource } from "./tower.resources";

export class UnitResources {
	// A blond chibi archer, 72x80 pixels. Drawn smaller than 21 px per unit so it doesn't fill the path.
	static elf: ShapedResource = {
		size: {
			width: 2.4,
			height: 2.67,
		},
		shape: "ellipse",
		image: createImage("/resources/units/elf/elf.png"),
	};
	static elfSheet = SpriteSheet.fromJson("/resources/units/elf/elf.sheet.png", "/resources/units/elf/elf.sheet.json");

	static choupisson: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/choupisson/choupisson.png"),
		shape: "ellipse",
	};
	static choupissonSheet = SpriteSheet.fromJson(
		"/resources/units/choupisson/choupisson.sheet.png",
		"/resources/units/choupisson/choupisson.sheet.json",
	);

	static dragon: ShapedResource = {
		size: {
			width: 3.3,
			height: 3.3,
		},
		image: createImage("/resources/units/dragon/dragon.png"),
		shape: "ellipse",
	};
	static dragonSheet = SpriteSheet.fromJson(
		"/resources/units/dragon/dragon.sheet.png",
		"/resources/units/dragon/dragon.sheet.json",
	);

	static whiteStag: ShapedResource = {
		size: {
			width: 3.6,
			height: 3.6,
		},
		image: createImage("/resources/units/white-stag/white-stag.png"),
		shape: "ellipse",
	};
	static whiteStagSheet = SpriteSheet.fromJson(
		"/resources/units/white-stag/white-stag.sheet.png",
		"/resources/units/white-stag/white-stag.sheet.json",
	);
	static whiteStagOneAntlerSheet = SpriteSheet.fromJson(
		"/resources/units/white-stag/white-stag-one-antler.sheet.png",
		"/resources/units/white-stag/white-stag-one-antler.sheet.json",
	);
	// The antler the stag drops, drawn at twice the stag's pixel scale so it reads on the ground: about the size of a
	// projectile.
	static whiteStagAntler: ShapedResource = {
		size: {
			width: 2.5,
			height: 2.5,
		},
		image: createImage("/resources/units/white-stag/white-stag-antler.png"),
		shape: "ellipse",
	};

	static ent: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/ent/ent.png"),
		shape: "ellipse",
	};
	static entSheet = SpriteSheet.fromJson("/resources/units/ent/ent.sheet.png", "/resources/units/ent/ent.sheet.json");

	static gobelin: ShapedResource = {
		size: {
			width: 2.8,
			height: 2.8,
		},
		image: createImage("/resources/units/gobelin/gobelin.png"),
		shape: "ellipse",
	};
	static gobelinSheet = SpriteSheet.fromJson(
		"/resources/units/gobelin/gobelin.sheet.png",
		"/resources/units/gobelin/gobelin.sheet.json",
	);

	// A helmeted dwarf with an orange beard, 72x68 pixels. Drawn smaller than 21 px per unit so it doesn't fill the path.
	static dwarf: ShapedResource = {
		size: {
			width: 2.4,
			height: 2.267,
		},
		image: createImage("/resources/units/dwarf/dwarf.png"),
		shape: "rectangle",
	};
	static dwarfSheet = SpriteSheet.fromJson(
		"/resources/units/dwarf/dwarf.sheet.png",
		"/resources/units/dwarf/dwarf.sheet.json",
	);

	// A small green frog, 81x81 pixels.
	static frog: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/frog/frog.png"),
		shape: "ellipse",
	};
	static frogSheet = SpriteSheet.fromJson(
		"/resources/units/frog/frog.sheet.png",
		"/resources/units/frog/frog.sheet.json",
	);

	static fox: ShapedResource = {
		size: {
			width: 3,
			height: 2.4375,
		},
		image: createImage("/resources/units/fox/fox.png"),
		shape: "ellipse",
	};
	static foxSheet = SpriteSheet.fromJson("/resources/units/fox/fox.sheet.png", "/resources/units/fox/fox.sheet.json");

	// A two headed goat, 92x88 pixels.
	static goGoat: ShapedResource = {
		size: {
			width: 3.3,
			height: 3.157,
		},
		image: createImage("/resources/units/go-goat/go-goat.png"),
		shape: "ellipse",
	};
	static goGoatSheet = SpriteSheet.fromJson(
		"/resources/units/go-goat/go-goat.sheet.png",
		"/resources/units/go-goat/go-goat.sheet.json",
	);

	// A bird person with colorful feathers, 80x76 pixels.
	static paradiseBird: ShapedResource = {
		size: {
			width: 3.2,
			height: 3.04,
		},
		image: createImage("/resources/units/paradise-bird/paradise-bird.png"),
		shape: "ellipse",
	};
	static paradiseBirdSheet = SpriteSheet.fromJson(
		"/resources/units/paradise-bird/paradise-bird.sheet.png",
		"/resources/units/paradise-bird/paradise-bird.sheet.json",
	);

	static brewmaster: ShapedResource = {
		size: {
			width: 3,
			height: 3,
		},
		image: createImage("/resources/units/brewmaster/brewmaster.png"),
		shape: "ellipse",
	};
	static brewmasterSheet = SpriteSheet.fromJson(
		"/resources/units/brewmaster/brewmaster.sheet.png",
		"/resources/units/brewmaster/brewmaster.sheet.json",
	);
}
