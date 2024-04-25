import { Cell, GridPosition } from "../../../../shared/position";
import { AnyUnit } from "../../../units/recruit/unit-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { BasicBarrack } from "../../recruit/implementation/basic-barrack-recruit";
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
			this.hooks.addUnits(this.unitRecruit.toBattle(spawnPoint, path, this.hooks), this);
		}
		this.finishCast(succes);
	}
}
