import { DragonBlueprint } from "../blueprint/implementation/dragon";
import { SoldierBlueprint } from "../blueprint/implementation/soldier";
import { UnitFixture } from "../blueprint/unit-fixtures";
import { Dragon } from "./implementation/dragon-recruit";
import { Soldier } from "./implementation/soldier-recruit";

export class UnitRecruitBuilder {
	buildSoldier(soldier: SoldierBlueprint) {
		return new Soldier(soldier);
	}
	buildDragon(dragon: DragonBlueprint) {
		return new Dragon(dragon);
	}
}

export class UnitRecruitFixture {
	static soldier = new UnitRecruitBuilder().buildSoldier(UnitFixture.soldier);
	static dragon = new UnitRecruitBuilder().buildDragon(UnitFixture.dragon);
}
