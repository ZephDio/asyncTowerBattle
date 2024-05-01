import { Cell } from "../../../shared/position";
import { CastleBlueprintFixtures } from "../blueprint/castle-fixtures";
import { HumanCastle } from "./implem/human-castle";

export class CastleFixture {
	static get allied() {
		return new HumanCastle(CastleBlueprintFixtures.allied,new Cell({ x : 0 , y : 5}));
	}
	static get enemy() {
		return new HumanCastle(CastleBlueprintFixtures.enemy,new Cell({ x : 0 , y : 5}));
	}
}
