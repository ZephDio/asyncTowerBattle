import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { Cast } from "../../../../shared/traits/engine/cast";
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

	override casts(): void {
		const cycle = this.cycles[this.cycle % this.cycles.length] as number;
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), this.castCost * cycle);
		this.cycle += 1;
	}

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().position.clone();
		const sucess = this.hooks.alliedFoodHooks.consumeFood(this.stats.foodCost);
		if (sucess) {
			if (!this.unitRecruit) throw new Error("Unit recruit is undefined in a Barrack Attempting to cast");
			this.hooks.addUnits(this.unitRecruit.toBattle(spawnPoint, path, this.hooks), this);
		}
		this.finishCast(sucess);
	}
}
