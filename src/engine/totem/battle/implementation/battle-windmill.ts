import { Derive, implementsTrait } from "@ddd-ts/traits";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { TPhysics } from "../../../../shared/traits/engine/core/physics";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cell, GridPosition } from "../../../../shared/position";
import { Windmill } from "../../recruit/implementation/windmill";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";
import { TFoodTag } from "../../../../shared/traits/engine/Tfood-tag";
import { Caster } from "../../../../shared/traits/engine/cast";
import { Stats } from "../../../stats/stats";
import { Status } from "../../../../shared/traits/engine/status";

export class BattleWindmill extends Derive(HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement, HTSynergy,TFoodTag) {
    hasTriggered = false;
	foodProduction: number = 5;
	constructor(
		public windmill: Windmill,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public override orientation: number,
	) {
		super({
			imageDrawable: windmill,
			hitboxHolder: windmill,
            synergy: windmill,
		});
		this.angle = this.orientation;
		this.gridShape = windmill.gridShape;
	}

	get realPosition(): GridPosition {
		return this.position;
	}

	tick() {
		if(this.hasTriggered) return
        this.hasTriggered = true;
        const elements = this.hooks.gridHooks.getRelativeNeighborsInArmy(this.cell,this.patternEffect.getRelativeCells(this.orientation));
        for(const element of elements){
            if(implementsTrait(element, TFoodTag)){
                this.hooks.alliedFoodHooks.addMaxFood(5);
                if(implementsTrait(element, Caster)){
                    const windmillBuff = new WindmillBuff({})
                    element.addStatus(windmillBuff)
                }
            }
        }
	}

	isAlive(): boolean {
		return true;
	}


	incrementFood() {
		this.hooks.alliedFoodHooks.addFood(this.foodProduction);
	}



	takeDamage(_damage: number): void {
		return;
	}
}

export class WindmillBuff extends Derive(Status){
    clock = 0
    stats: Stats;
    override key = 'windmill-buff'
    override duration = Infinity;
    hasTriggered = false;
    override tick(): void {
        if(this.hasTriggered) return
        this.hasTriggered = true;
        this.stats.basePercentStat.castSpeed += 0.25;
    }
}