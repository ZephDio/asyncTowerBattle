import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { BattleBarrack } from "../battle-barrack";

export class WaveBattleBarrack extends Derive(BattleBarrack) {
	castCost: number;

	cycles = [2.6, 0.2, 0.2];
	cycle = 0;

	constructor(
		public readonly barrackRecruit: WaveBarrack,
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

	override casts(): void {
		const cycle = this.cycles[this.cycle % this.cycles.length] as number;
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost * cycle);
		this.cycle += 1;
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
