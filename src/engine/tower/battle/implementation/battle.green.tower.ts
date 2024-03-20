import { GreenTower } from "../../entity/implementation/green-tower";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { BattleTower } from "../battle-tower";

export class GreenBattleTower extends BattleTower<TowerRecruit<GreenTower>> {
  type = "green" as const;
}
