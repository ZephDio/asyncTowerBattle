import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { ElfBlueprint } from "./implementation/elf-blueprint";
import { ParadiseBirdBlueprint } from "./implementation/paradise-bird-blueprint";
import { GoGoatBlueprint } from "./implementation/go-goat-blueprint";
import { WhiteStagBlueprint } from "./implementation/white-stag-blueprint";

export class UnitBuilder {
	buildElf() {
		return new ElfBlueprint({});
	}

	buildDragon() {
		return new DragonBlueprint({});
	}

	buildWhiteStag() {
		return new WhiteStagBlueprint({});
	}

	buildGoGoat() {
		return new GoGoatBlueprint({});
	}

	buildParadiseBird() {
		return new ParadiseBirdBlueprint({});
	}
}

export class UnitFixture {
	static get elf() {
		return new UnitBuilder().buildElf();
	}
	static get dragon() {
		return new UnitBuilder().buildDragon();
	}
	static get whiteStag() {
		return new UnitBuilder().buildWhiteStag();
	}
	static get goGoat() {
		return new UnitBuilder().buildGoGoat();
	}
	static get paradiseBird() {
		return new UnitBuilder().buildParadiseBird();
	}
}
