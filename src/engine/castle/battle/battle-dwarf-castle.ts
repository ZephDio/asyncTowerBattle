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
import { DwarfCastle } from "../recruit/implem/dwarf-castle";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { HTDescriptor } from "../../../shared/traits/render/huds/item-descriptor";

export class BattleDwarfCastle extends Derive(
	HTHitbox,
	TRenderable,
	HTImageDrawable,
	TPhysics,
	GridElement,
	Caster,
	Orientable,
	HTDescriptor,
) {
	public actualLife: number;
	public maxLife: number;
	public hooks: BattleArmyHooks;

	constructor(
		recruit: DwarfCastle,
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
			descriptor: recruit,
		});
		this.gridShape = recruit.gridShape;
		this.setOrientation(orientation);
	}

	initHooks(hooks: BattleArmyHooks) {
		this.hooks = hooks;
	}

	isAlive() {
		return this.actualLife > 0;
	}

	casts() {
		const cost = this.hooks.getDefaultUnit().cost;
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), cost);
	}

	override takeDamage(damage: number): void {
		this.actualLife -= damage;
		if (this.actualLife <= 0) {
			this.onDeath();
		}
	}

	onCastResolve() {
		this.hooks.addUnits(
			this.hooks.getDefaultUnit().toBattle(this.position.clone(), this.hooks.getEnemyPath(), this.hooks),
			this,
		);
		this.finishCast(true);
	}

	produceFood() {
		this.foodHooks.addFood(3.5 / 32);
	}

	tick() {
		this.produceFood();
		this.tickCast();
	}
}
