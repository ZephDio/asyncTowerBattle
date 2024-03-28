import { OrangeTowerRecruit } from "../../recruit/implementation/orange-tower-recruit";
import { BattleTower } from "../battle-tower";

export class OrangeBattleTower extends BattleTower<OrangeTowerRecruit> {
	type = "orange" as const;

	tick() {
		const neighbor = this.hooks.gridHooks.getRelativeNeighbor(this.gridPosition, { gridX: 1, gridY: 1 });
		console.log(neighbor); // yay
	}
}
