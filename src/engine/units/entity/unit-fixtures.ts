import { Dragon } from "./implementation/dragon";
import { Soldier } from "./implementation/soldier";

export class UnitBuilder {
	buildSoldier() {
		return new Soldier();
	}

	buildDragon() {
		return new Dragon();
	}
}

export class UnitFixture {
	static soldier = new UnitBuilder().buildSoldier();
	static dragon = new UnitBuilder().buildDragon();
}
