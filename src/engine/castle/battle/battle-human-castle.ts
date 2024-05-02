import { Cell, GridPosition } from "../../../shared/position";
import { HTImageDrawable } from "../../../shared/traits/render/image-drawable";
import { Derive } from "@ddd-ts/traits";
import { TPhysics } from "../../../shared/traits/engine/core/physics";
import { HTHitbox } from "../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { FoodHooks } from "../../food/battle-food-economy";
import { Cast, Caster } from "../../../shared/traits/engine/cast";
import { Orientable } from "../../../shared/traits/engine/core/orientable";
import { HumanCastle } from "../recruit/implem/human-castle";
import { seconds } from "../../../shared/seconds";

export class BattleHumanCastle extends Derive(HTHitbox, TRenderable, HTImageDrawable, TPhysics, GridElement, Caster, Orientable) {
	public actualLife: number;
	public maxLife: number;

	constructor(
		recruit: HumanCastle,
		public onDeath: () => void,
		public cell: Cell,
		public position: GridPosition,
		orientation: number,
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
		this.gridShape = recruit.gridShape;
		this.setOrientation(orientation);
	}

	isAlive() {
		return this.actualLife > 0;
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), seconds(1));
	}

	onCastResolve() {
		this.foodHooks.addFood(4);
		this.finishCast(true);
	}

	tick() {
		this.tickCast();
	}
}
