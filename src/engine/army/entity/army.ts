import { Castle } from "../../castle/entity/castle";
import { CastleRecruit } from "../../castle/recruit/castle-recruit";
import { ArmyPath } from "../../path/entity/path";
import { Recruit } from "../../../shared/physic";
import { TowerRecruit } from "../../tower/recruit/tower-recruit";
import { Grid } from "../../grid/grid";
import { BarrackRecruit } from "../../barrack/recruit/barrack-recruit";

export class Army {
	constructor(
		public castle: CastleRecruit<Castle>,
		public towers: TowerRecruit[],
		public path: ArmyPath,
		public grid: Grid,
		public barracks: BarrackRecruit[],
	) {}

	recruit(recruit: Recruit, type: string) {
		if (type === "tower") {
			this.grid.setElement(recruit as TowerRecruit);
			this.towers.push(recruit as TowerRecruit);
		}
	}
}
