import { Cell } from "../../../shared/position";
import { CastleBlueprintFixtures } from "../blueprint/castle-fixtures";
import { Castle } from "./castle-recruit";

export class CastleFixture {
	static get allied() {
		return new Castle(CastleBlueprintFixtures.allied,new Cell({ x : 0 , y : 5}));
	}
	static get enemy() {
		return new Castle(CastleBlueprintFixtures.enemy,new Cell({ x : 0 , y : 5}));
	}
}
