import { Cell } from "../../../shared/position";
import { DragonBlueprint } from "../blueprint/implementation/dragon";
import { PriestBlueprint } from "../blueprint/implementation/priest";
import { SoldierBlueprint } from "../blueprint/implementation/soldier";
import { Dragon } from "./implementation/dragon-recruit";
import { Priest } from "./implementation/priest-recruit";
import { Soldier } from "./implementation/soldier-recruit";

export class UnitRecruitBuilder {
	buildSoldier(soldier?: SoldierBlueprint) {
		return new Soldier(new Cell({ x: 0, y: 1 }), soldier);
	}
	buildDragon(dragon?: DragonBlueprint) {
		return new Dragon(new Cell({ x: 0, y: 0 }), dragon);
	}
	buildPriest(priest?: PriestBlueprint){
		return new Priest(new Cell({ x: 0, y: 2 }), priest);
	}
}

export class UnitRecruitFixture {
	static get soldier() {
		return new UnitRecruitBuilder().buildSoldier();
	}
	static get dragon() {
		return new UnitRecruitBuilder().buildDragon();
	}
	static get priest(){
		return new UnitRecruitBuilder().buildPriest();
	}
}
