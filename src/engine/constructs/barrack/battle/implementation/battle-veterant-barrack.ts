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
		public readonly barrack: BasicBarrack,
		public readonly position: GridPosition,
		public readonly cell: Cell,

		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit | null,
		override _orientation: number,
	) {
		super({
			casterRecruit: barrack,
			imageDrawable: barrack,
			maxHealth: barrack.stats.health,
			attack: barrack.stats.damage,
			movementSpeed: barrack.stats.speed,
			castSpeed: barrack.stats.castSpeed,
			attackSpeed: barrack.stats.attackSpeed,
			foodCost: barrack.stats.foodConsumptionOnCast,
			range: barrack.stats.range,
			onDeath: () => {},
			hitboxHolder: barrack,
			descriptor: barrack,
			tagHolder: barrack,
		});
		this.castCost = unitRecruit ? unitRecruit.stats.summonTime : this.hooks.getDefaultUnit().stats.summonTime;
		this.gridShape = barrack.gridShape;
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const unit = this.unitRecruit
			? this.unitRecruit.toBattle(spawnPoint, path, this.hooks)
			: this.hooks.getDefaultUnit().toBattle(spawnPoint, path, this.hooks);
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
