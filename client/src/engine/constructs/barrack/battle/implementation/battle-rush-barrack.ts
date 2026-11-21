import { Cell, GridPosition } from "../../../../../shared/position";
import { AnyUnit } from "../../../../units/recruit/unit";
import { BattleArmyHooks } from "../../../../army/battle/battle-army";
import { Derive } from "@ddd-ts/traits";
import { BattleBarrack } from "../battle-barrack";
import { RushBarrack } from "../../recruit/implementation/rush-barrack";
import { BoardOrientation } from "../../../../../shared/traits/engine/core/board-orientation";
import { PermanentBuff } from "../../../../army/battle/permanent-buff";

// Summons like the basic barrack at its faster cast speed, and every unit it summons eats more: a permanent buff
// on its food upkeep (paid every 2 seconds) for as long as it lives.
export class RushBattleBarrack extends Derive(BattleBarrack) {
	castCost: number;

	constructor(
		public readonly barrack: RushBarrack,
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
		});
		this.castCost = this.bondedUnit.stats.summonTime;
		this.gridShape = barrack.gridShape;
		this.summonedUpkeep = new PermanentBuff(hooks, null, "foodCost", barrack.blueprint.extraFoodPerUnit);
	}

	readonly summonedUpkeep: PermanentBuff;

	onCastResolve(): void {
		const path = this.hooks.getEnemyPath();
		const spawnPoint = this.hooks.getAlliedCastle().spawnPosition.clone();
		const unit = this.bondedUnit.toBattle(spawnPoint, path, this.hooks);
		this.summonedUpkeep.target(unit);
		this.hooks.addUnits(unit, this);
		this.finishCast();
	}
}
