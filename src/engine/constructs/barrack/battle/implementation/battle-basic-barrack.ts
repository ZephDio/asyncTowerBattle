import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack";
import { BattleBarrack } from "../battle-barrack";

export class BasicBattleBarrack extends Derive(BattleBarrack) {
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

		this.castCost = unitRecruit ? unitRecruit.stats.summonTime : this.hooks.getDefaultUnit().stats.summonTime;
		this.gridShape = barrackRecruit.gridShape;
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const unit = this.unitRecruit
			? this.unitRecruit.toBattle(spawnPoint, path, this.hooks)
			: this.hooks.getDefaultUnit().toBattle(spawnPoint, path, this.hooks);
		this.hooks.addUnits(unit, this);
		this.finishCast();
	}
}
