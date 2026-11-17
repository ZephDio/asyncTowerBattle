import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { ElfBlueprint } from "./implementation/elf-blueprint";
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
}
