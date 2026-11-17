import { Cell } from "../../../shared/position";
import { ChoupissonBlueprint } from "../blueprint/implementation/choupisson-blueprint";
import { DragonBlueprint } from "../blueprint/implementation/dragon-blueprint";
import { WhiteStagBlueprint } from "../blueprint/implementation/white-stag-blueprint";
import { Choupisson } from "./implementation/choupisson";
import { Dragon } from "./implementation/dragon";
import { WhiteStag } from "./implementation/white-stag";
import { FoxBlueprint } from "../blueprint/implementation/fox-blueprint";
import { Fox } from "./implementation/fox";
import { GoGoatBlueprint } from "../blueprint/implementation/go-goat-blueprint";
import { GoGoat } from "./implementation/go-goat";
import { ParadiseBirdBlueprint } from "../blueprint/implementation/paradise-bird-blueprint";
import { ParadiseBird } from "./implementation/paradise-bird";

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
	buildGoGoat(goGoat?: GoGoatBlueprint) {
		return new GoGoat(new Cell({ x: 0, y: 0 }), goGoat);
	}
	buildParadiseBird(paradiseBird?: ParadiseBirdBlueprint) {
		return new ParadiseBird(new Cell({ x: 0, y: 0 }), paradiseBird);
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
	static get goGoat() {
		return new UnitRecruitBuilder().buildGoGoat();
	}
	static get paradiseBird() {
		return new UnitRecruitBuilder().buildParadiseBird();
	}
}
