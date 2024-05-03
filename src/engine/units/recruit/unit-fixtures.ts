import { Cell } from "../../../shared/position";
import { BersekerBlueprint } from "../blueprint/implementation/berseker-blueprint";
import { Berseker } from "./implementation/berseker";
import { ChoupissonBlueprint } from "../blueprint/implementation/choupisson-blueprint";
import { DragonBlueprint } from "../blueprint/implementation/dragon-blueprint";
import { PriestBlueprint } from "../blueprint/implementation/priest-blueprint";
import { Choupisson } from "./implementation/choupisson";
import { Dragon } from "./implementation/dragon";
import { Priest } from "./implementation/priest";
import { FoxBlueprint } from "../blueprint/implementation/fox-blueprint";
import { Fox } from "./implementation/fox";

export class UnitRecruitBuilder {
	// buildSoldier(soldier?: SoldierBlueprint) {
	// 	return new Soldier(new Cell({ x: 0, y: 1 }), soldier);
	// }
	buildDragon(dragon?: DragonBlueprint) {
		return new Dragon(new Cell({ x: 0, y: 0 }), dragon);
	}
	buildPriest(priest?: PriestBlueprint) {
		return new Priest(new Cell({ x: 0, y: 2 }), priest);
	}
	buildBerseker(berseker?: BersekerBlueprint) {
		return new Berseker(new Cell({ x: 0, y: 2 }), berseker);
	}
	buildChoupisson(choupisson?: ChoupissonBlueprint) {
		return new Choupisson(new Cell({ x: 0, y: 2 }), choupisson);
	}
	buildGluttonFox(fox? : FoxBlueprint) {
		return new Fox(new Cell({ x: 0, y: 2 }), fox);
	}
}

export class UnitRecruitFixture {
	// static get soldier() {
	// 	return new UnitRecruitBuilder().buildSoldier();
	// }
	static get dragon() {
		return new UnitRecruitBuilder().buildDragon();
	}
	static get priest() {
		return new UnitRecruitBuilder().buildPriest();
	}
	static get berseker() {
		return new UnitRecruitBuilder().buildBerseker();
	}
	static get choupisson() {
		return new UnitRecruitBuilder().buildChoupisson();
	}
	static get fox() {
		return new UnitRecruitBuilder().buildGluttonFox();
	}
}
