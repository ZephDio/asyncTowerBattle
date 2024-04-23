import { Derive } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TPhysics } from "../../../../shared/traits/engine/core/physics";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { CropsField } from "../../recruit/implementation/crops-flied-recruit";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { TFoodTag } from "../../../../shared/traits/engine/Tfood-tag";

export class BattleCropsField extends Derive(HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement, Caster, TFoodTag) {
	foodProduction: number = 5;
	constructor(
		public cropsField: CropsField,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public override orientation: number,
	) {
		super({
			imageDrawable: cropsField,
			hitboxHolder: cropsField,
			casterRecruit: cropsField,
			maxHealth: NaN,
			attack: NaN,
			attackSpeed: NaN,
			movementSpeed: NaN,
			castSpeed: cropsField.castSpeed,
			foodCost: NaN,
			onDeath: () => {},
		});
		this.angle = this.orientation;
		this.gridShape = cropsField.gridShape;
	}

	get realPosition(): GridPosition {
		return this.position;
	}

	tick() {
		this.tickCast();
	}

	isAlive(): boolean {
		return true;
	}

	onCastResolve() {
		this.produceFood();
		this.finishCast();
	}

	produceFood() {
		this.hooks.alliedFoodHooks.addFood(this.foodProduction);
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 100);
	}

	takeDamage(_damage: number): void {
		return;
	}
}
