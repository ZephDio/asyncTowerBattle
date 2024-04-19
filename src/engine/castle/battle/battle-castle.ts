import { Castle } from "../recruit/castle-recruit";
import { Cell, GridPosition } from "../../../shared/position";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../shared/traits/engine/core/physics";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { FoodHooks } from "../../food/battle-food-economy";
import { Cast, Caster } from "../../../shared/traits/engine/cast";

export class BattleCastle extends Derive(HTHitbox, TRenderable, HTImageDrawable, TPhysics, GridElement, Caster) {
	public actualLife: number;
	public maxLife: number;

	constructor(
		recruit: Castle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		public override orientation: number,
		public foodHooks: FoodHooks,
	) {
		super({
			imageDrawable: recruit,
			hitboxHolder: recruit,
			casterRecruit: recruit,
			maxHealth: recruit.maxLife,
			attack: NaN,
			movementSpeed: NaN,
			castSpeed: recruit.castSpeed,
			attackSpeed: NaN,
			foodCost: NaN,
			onDeath: () => this.onDeath(),
		});
		this.angle = this.orientation;
		this.gridShape = recruit.gridShape;
	}

	isAlive() {
		return this.actualLife > 0;
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), 64);
	}

	onCastResolve() {
		this.foodHooks.addFood(4);
		this.finishCast();
	}

	tick() {
		this.tickCast();
	}
}
