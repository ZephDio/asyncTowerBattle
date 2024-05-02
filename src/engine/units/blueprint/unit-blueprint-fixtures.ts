import { BersekerBlueprint } from "./implementation/berseker-blueprint";
import { DragonBlueprint } from "./implementation/dragon-blueprint";
import { PriestBlueprint } from "./implementation/priest-blueprint";
import { SoldierBlueprint } from "./implementation/soldier-blueprint";

export class UnitBuilder {
	buildSoldier() {
		return new SoldierBlueprint({});
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
	static get soldier() {
		return new UnitBuilder().buildSoldier();
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
