import { Cell } from "../../../shared/position";
import { ChoupissonBlueprint } from "../blueprint/implementation/choupisson-blueprint";
import { DragonBlueprint } from "../blueprint/implementation/dragon-blueprint";
import { WhiteStagBlueprint } from "../blueprint/implementation/white-stag-blueprint";
import { Choupisson } from "./implementation/choupisson";
import { Dragon } from "./implementation/dragon";
import { WhiteStag } from "./implementation/white-stag";
import { FoxBlueprint } from "../blueprint/implementation/fox-blueprint";
import { Fox } from "./implementation/fox";

export class UnitRecruitBuilder {
	// buildSoldier(soldier?: SoldierBlueprint) {
	// 	return new Soldier(new Cell({ x: 0, y: 1 }), soldier);
	// }
	buildDragon(dragon?: DragonBlueprint) {
		return new Dragon(new Cell({ x: 0, y: 0 }), dragon);
	}
	buildWhiteStag(whiteStag?: WhiteStagBlueprint) {
		return new WhiteStag(new Cell({ x: 0, y: 2 }), whiteStag);
	}
	buildChoupisson(choupisson?: ChoupissonBlueprint) {
		return new Choupisson(new Cell({ x: 0, y: 2 }), choupisson);
	}
	buildGluttonFox(fox?: FoxBlueprint) {
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
	static get whiteStag() {
		return new UnitRecruitBuilder().buildWhiteStag();
	}
	static get choupisson() {
		return new UnitRecruitBuilder().buildChoupisson();
	}
	static get fox() {
		return new UnitRecruitBuilder().buildGluttonFox();
	}
}
