import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { BattleBarrack } from "../battle-barrack";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
import { Status } from "../../../../shared/traits/engine/status";
import { Stats } from "../../../stats/stats";

export class VeterantBattleBarrack extends Derive(BattleBarrack) {
	castCost: number;

	constructor(
		public readonly barrackRecruit: BasicBarrack,
		public readonly position: GridPosition,
		public readonly cell: Cell,

		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit | null,
		override _orientation: number,
	) {
		super({
			casterRecruit: barrackRecruit,
			imageDrawable: barrackRecruit,
			maxHealth: NaN,
			attack: NaN,
			movementSpeed: NaN,
			castSpeed: barrackRecruit.productionSpeed,
			attackSpeed: NaN,
			foodCost: barrackRecruit.foodCost,
			onDeath: () => {},
			hitboxHolder: barrackRecruit,
			descriptor: barrackRecruit,
		});
		this.castCost = unitRecruit ? unitRecruit.cost : NaN;
		this.gridShape = barrackRecruit.gridShape;
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const succes = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (succes) {
			if (!this.unitRecruit) throw new Error("Unit recruit is undefined in a Barrack Attempting to cast");
			const unit = this.unitRecruit.toBattle(spawnPoint, path, this.hooks);
			const buff = new VeterantBuff();
			unit.addStatus(buff);
			unit.addSize(0.3);
			this.hooks.addUnits(unit, this);
		}
		this.finishCast();
	}
}
export class VeterantBuff extends Derive(Status) {
	key = "veterant";
	clock = 0;
	duration = Infinity;
	stats: Stats;
	hasTriggered = false;

	constructor() {
		super({});
	}
	tick() {
		this.clock++;
		if (this.hasTriggered) return;
		this.stats.basePercentStat.movementSpeed -= 10;
		this.stats.basePercentStat.attack += 20;
		this.stats.addMaxHealth(100, true);
		this.hasTriggered = true;
	}

	onRemove() {
		this.stats.removeStatus(this);
	}
}
