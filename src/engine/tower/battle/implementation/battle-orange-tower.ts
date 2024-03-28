import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { BattleTower } from "../battle-tower";

export class OrangeBattleTower extends BattleTower<OrangeTowerRecruit> {
  type = "orange" as const;
  hasTriggered = false;

  tick() {
    if (!this.hasTriggered) {
      const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.gridPosition, [
        { gridX: 0, gridY: 1 },
        { gridX: 0, gridY: -1 },
      ]);
      for (const neighbor of neighbors) {
        if (["blue", "orange", "green"].includes(neighbor.type)) {
          (neighbor as BattleTower).attackDamage += 20;
        }
      }
      this.hasTriggered = true;
    }
  }
}
