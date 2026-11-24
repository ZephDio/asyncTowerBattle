import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { barrackNameCastSpeedPercent } from "../../barrack-name-synergy";
import { BattleBarrack } from "../battle-barrack";
import { VeterantBarrack } from "../../recruit/implementation/veterant-barrack";
import { Status } from "../../../../../shared/traits/engine/status";
import { Stats } from "../../../../stats/stats";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class VeterantBattleBarrack extends Derive(BattleBarrack, HTSynergy, BattleStartTrigger) {
	castCost: number;

	constructor(
		public readonly barrack: VeterantBarrack,
		public readonly position: GridPosition,
		public readonly cell: Cell,

		public readonly hooks: BattleArmyHooks,
		public readonly unitRecruit: AnyUnit | null,
		override orientation: BoardOrientation,
	) {
		super({
			casterRecruit: barrack,
			imageDrawable: barrack,
			maxHealth: barrack.stats.health,
			castleDamage: barrack.stats.castleDamage,
			projectileDamage: barrack.stats.projectileDamage,
			movementSpeed: barrack.stats.speed,
			castSpeed: barrack.stats.castSpeed,
			attackSpeed: barrack.stats.attackSpeed,
			foodCost: barrack.stats.foodConsumptionOnCast,
			range: barrack.stats.range,
			onDeath: () => {},
			hitboxHolder: barrack,
			descriptor: barrack,
			tagHolder: barrack,
			rarityHolder: barrack,
			synergy: barrack,
			battleStartRecruit: barrack,
		});
		this.castCost = unitRecruit ? unitRecruit.stats.summonTime : this.hooks.getDefaultUnit().stats.summonTime;
		this.gridShape = barrack.gridShape;
	}

	onBattleStart(): void {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		this.stats.basePercentStat.castSpeed += barrackNameCastSpeedPercent(this.barrack.description.name, neighbors);
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().spawnPosition.clone();
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
		this.stats.basePercentStat.castleDamage += 20;
		this.stats.addMaxHealth(130, true);
		this.hasTriggered = true;
	}

	stack(_status: VeterantBuff): void {}

	onRemove() {
		this.stats.basePercentStat.movementSpeed += 10;
		this.stats.basePercentStat.castleDamage -= 20;
	}
}
