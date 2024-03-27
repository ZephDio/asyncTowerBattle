import { OrangeTower } from "../../entity/implementation/orange-tower";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { BattleTower } from "../battle-tower";

export class OrangeBattleTower extends BattleTower<TowerRecruit<OrangeTower>> {
	type = "orange" as const;
}
