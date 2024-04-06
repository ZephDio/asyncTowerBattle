import { DragonBlueprint } from "./implementation/dragon";
import { SoldierBlueprint } from "./implementation/soldier";

export class UnitBuilder {
	buildSoldier() {
		return new SoldierBlueprint({});
	}

	buildDragon() {
		return new DragonBlueprint({});
	}
}

export class UnitFixture {
	static soldier = new UnitBuilder().buildSoldier();
	static dragon = new UnitBuilder().buildDragon();
}
