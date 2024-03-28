import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { TowerRecruit } from "../../recruit/tower-recruit";
import { BattleTower } from "../battle-tower";

export class OrangeBattleTower extends BattleTower<OrangeTowerRecruit> {
	type = "orange" as const;
	asProcked = false;

	tick() {
		if (!this.asProcked) {
			const neighbor = this.hooks.gridHooks.getRelativeNeighbor(this.gridPosition, { gridX: 1, gridY: 0 });
			if (neighbor && ["blue", "orange", "green"].includes(neighbor.type)) {
				(neighbor as BattleTower).attackDamage += 20;
			}
			this.asProcked = true;
		}
	}
}
