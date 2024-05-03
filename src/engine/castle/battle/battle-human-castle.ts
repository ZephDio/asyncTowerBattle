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
import { BattleArmyHooks } from "../../army/battle/battle-army";

export class BattleHumanCastle extends Derive(HTHitbox, TRenderable, HTImageDrawable, TPhysics, GridElement, Caster, Orientable) {
	public actualLife: number;
	public maxLife: number;
	public hooks : BattleArmyHooks;

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

	initHooks(hooks: BattleArmyHooks){
        this.hooks = hooks;
    }
	isAlive() {
		return this.actualLife > 0;
	}

	casts() {
		const cost = this.hooks.getDefaultUnit().cost
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), cost);
	}

	produceFood(){
		this.foodHooks.addFood(4/32);
	}

	onCastResolve() {
		this.hooks.addUnits(this.hooks.getDefaultUnit().toBattle(this.position.clone(), this.hooks.getEnemyPath(), this.hooks), this);
		this.finishCast(true);
	}

	tick() {
		this.produceFood()
		this.tickCast();
	}
}
