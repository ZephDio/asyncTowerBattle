import { BlueTower } from "../../entity/implementation/blue-tower";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { BattleTower } from "../battle-tower";

export class BlueBattleTower extends BattleTower<TowerRecruit<BlueTower>> {
  type = "blue" as const;
}
