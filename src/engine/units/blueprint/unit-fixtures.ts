import { DragonBlueprint } from "./implementation/dragon";
import { PriestBlueprint } from "./implementation/priest";
import { SoldierBlueprint } from "./implementation/soldier";

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
}

export class UnitFixture {
	static get soldier() {
		return new UnitBuilder().buildSoldier();
	} 
	static get dragon(){
		return new UnitBuilder().buildDragon();
	} 
	static get priest(){
		return new UnitBuilder().buildPriest();
	}
}
