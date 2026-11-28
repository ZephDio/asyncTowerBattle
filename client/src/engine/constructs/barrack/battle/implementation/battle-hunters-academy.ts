import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { HTSynergy } from "../../../../../shared/traits/engine/synergy";
import { BattleStartTrigger } from "../../../../../shared/traits/engine/battle-start";
import { huntersAcademyCastSpeedPercent } from "../../barrack-name-synergy";
import { BattleBarrack } from "../battle-barrack";
import { HuntersAcademy } from "../../recruit/implementation/hunters-academy";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

// Summons like the basic barrack, faster for each barrack of another name and each forest on its stars.
export class HuntersAcademyBattleBarrack extends Derive(BattleBarrack, HTSynergy, BattleStartTrigger) {
	castCost: number;

	constructor(
		public readonly barrack: HuntersAcademy,
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
		this.castCost = this.bondedUnit.stats.summonTime;
		this.gridShape = barrack.gridShape;
	}

	onBattleStart(): void {
		const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
			this.cell,
			this.patternEffect.getRelativeCells(this.orientation),
		);
		this.stats.basePercentStat.castSpeed += huntersAcademyCastSpeedPercent(this.barrack.description.name, neighbors);
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().spawnPosition.clone();
		const unit = this.bondedUnit.toBattle(spawnPoint, path, this.hooks);
		this.hooks.addUnits(unit, this);
		this.finishCast();
	}
}
