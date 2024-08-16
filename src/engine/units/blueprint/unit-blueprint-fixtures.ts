import { BersekerBlueprint } from "./implementation/berseker-blueprint";
import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { ElfBlueprint } from "./implementation/elf-blueprint";
import { PriestBlueprint } from "./implementation/priest-blueprint";

export class UnitBuilder {
	buildElf() {
		return new ElfBlueprint({});
	}

	buildDragon() {
		return new DragonBlueprint({});
	}

	buildPriest() {
		return new PriestBlueprint({});
	}

	buildBerseker() {
		return new BersekerBlueprint({});
	}
}

export class UnitFixture {
	static get elf() {
		return new UnitBuilder().buildElf();
	}
	static get dragon() {
		return new UnitBuilder().buildDragon();
	}
	static get priest() {
		return new UnitBuilder().buildPriest();
	}
	static get berseker() {
		return new UnitBuilder().buildBerseker();
	}
}
