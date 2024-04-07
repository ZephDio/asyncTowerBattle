import { Cell } from "../../../shared/position";
import { DragonBlueprint } from "../blueprint/implementation/dragon";
import { SoldierBlueprint } from "../blueprint/implementation/soldier";
import { UnitFixture } from "../blueprint/unit-fixtures";
import { Dragon } from "./implementation/dragon-recruit";
import { Soldier } from "./implementation/soldier-recruit";

export class UnitRecruitBuilder {
	buildSoldier(soldier: SoldierBlueprint) {
		return new Soldier(soldier, new Cell({ x: 0, y: 1 }));
	}
	buildDragon(dragon: DragonBlueprint) {
		return new Dragon(dragon, new Cell({ x: 0, y: 0 }));
	}
}

export class UnitRecruitFixture {
	static get soldier() {
		return new UnitRecruitBuilder().buildSoldier(UnitFixture.soldier);
	}
	static get dragon() {
		return new UnitRecruitBuilder().buildDragon(UnitFixture.dragon);
	}
}
