import { CastleBlueprintFixtures } from "../blueprint/castle-fixtures";
import { Castle } from "./castle-recruit";

export class CastleFixture {
	static get allied() {
		return new Castle(CastleBlueprintFixtures.allied);
	}
	static get enemy() {
		return new Castle(CastleBlueprintFixtures.enemy);
	}
}
