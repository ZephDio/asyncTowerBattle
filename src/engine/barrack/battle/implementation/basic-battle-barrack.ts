import { Position } from "../../../../shared/position";
import { BattlePath } from "../../../path/entity/path";
import { UnitRecruit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Unit } from "../../../units/entity/units";
import { BattleBarrack, UnitProduction } from "../battle-barrack";
import { BarrackRecruit } from "../../recruit/barrack-recruit";

export class BasicBattleBarrack<BasicBarrackRecruit extends BarrackRecruit> extends BattleBarrack<BarrackRecruit> {
	onGoingProduction = null as null | UnitProduction;
	constructor(
		productionSpeed: number,
		barrackRecruit: BasicBarrackRecruit,
		position: Position,
		path: BattlePath,
		hooks: BattleArmyHooks,
		recruit: UnitRecruit<Unit>,
	) {
		super(barrackRecruit, productionSpeed, position, path, recruit, hooks);
	}

	tick() {
		if (this.onGoingProduction) {
			this.onGoingProduction.tick();
		}
		if (!this.onGoingProduction) {
			this.onGoingProduction = new UnitProduction(this, () => {
				this.produce();
				this.onGoingProduction = null;
			});
		}
	}

	produce() {
		this.hooks.addUnits(this.recruit.toBattle({ x: this.position.x, y: this.position.y }, this.path, this.hooks), this);
	}
}
