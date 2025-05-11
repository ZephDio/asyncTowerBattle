import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { BattleBarrack } from "../battle-barrack";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack";
import { Status } from "../../../../../shared/traits/engine/status";
import { Stats } from "../../../../stats/stats";

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
			maxHealth: barrackRecruit.stats.health,
			attack: barrackRecruit.stats.damage,
			movementSpeed: barrackRecruit.stats.speed,
			castSpeed: barrackRecruit.stats.castSpeed,
			attackSpeed: barrackRecruit.stats.attackSpeed,
			foodCost: barrackRecruit.stats.foodConsumptionOnCast,
			range: barrackRecruit.stats.range,
			onDeath: () => {},
			hitboxHolder: barrackRecruit,
			descriptor: barrackRecruit,
		});
		this.castCost = unitRecruit
			? unitRecruit.stats.summonTime * 1.6
			: this.hooks.getDefaultUnit().stats.summonTime * 1.6;
		this.gridShape = barrackRecruit.gridShape;
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const unit = this.unitRecruit
			? this.unitRecruit.toBattle(spawnPoint, path, this.hooks)
			: this.hooks.getDefaultUnit().toBattle(spawnPoint, path, this.hooks);
		this.hooks.addUnits(unit, this);
		const buff = new VeterantBuff();
		unit.addBoon(buff);
		unit.addSize(0.3);
		this.hooks.addUnits(unit, this);
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
		this.stats.addMaxHealth(130, true);
		this.hasTriggered = true;
	}

	stack(_status: VeterantBuff): void {}

	onRemove() {
		this.stats.basePercentStat.movementSpeed += 10;
		this.stats.basePercentStat.attack -= 20;
	}
}
