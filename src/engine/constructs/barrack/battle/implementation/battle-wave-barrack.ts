import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { Cast } from "../../../../../shared/traits/engine/cast";
import { WaveBarrack } from "../../recruit/implementation/wave-barrack";
import { BattleBarrack } from "../battle-barrack";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";

export class WaveBattleBarrack extends Derive(BattleBarrack) {
	castCost: number;

	cycles = [2.6, 0.2, 0.2];
	cycle = 0;

	constructor(
		public readonly barrack: WaveBarrack,
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
			rarityHolder: barrack,
		});
		this.castCost = unitRecruit ? unitRecruit.stats.summonTime : this.hooks.getDefaultUnit().stats.summonTime;
		this.gridShape = barrack.gridShape;
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
