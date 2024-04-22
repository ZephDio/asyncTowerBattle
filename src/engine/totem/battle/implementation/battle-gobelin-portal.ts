import { Derive, implementsTrait } from "@ddd-ts/traits";
import { TPhysics } from "../../../../shared/traits/engine/core/physics";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { HTImageDrawable } from "../../../../shared/traits/render/image-drawable";
import { HTHitbox } from "../../../../shared/traits/engine/core/THitbox";
import { GridElement } from "../../../../shared/traits/engine/core/grid-element";
import { TRenderable } from "../../../../shared/traits/render/renderable";
import { Caster } from "../../../../shared/traits/engine/cast";
import { GobelinPortal } from "../../recruit/implementation/gobelin-totem-recruit";

export class BattleGobelinPortal extends Derive(HTHitbox, TPhysics, HTImageDrawable, TRenderable, GridElement) {
	hasTriggered = false;

	constructor(
		public portal: GobelinPortal,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		public override orientation: number,
	) {
		super({ imageDrawable: portal, hitboxHolder: portal });
		this.angle = this.orientation;
		this.gridShape = portal.gridShape;
	}

	get realPosition(): GridPosition {
		return this.position;
	}

	tick() {
        if (!this.hasTriggered){
            const neighbors = this.hooks.gridHooks.getRelativeNeighborsInArmy(
                this.cell,
                this.portal.patternEffect.getRelativeCells(this.portal.orientation),
            );
            for (const neighbor of neighbors) {
                if (implementsTrait(neighbor, Caster)) {
                    neighbor.subscribeOnCast(this, this.gobelinSpawn.bind(this))
                }
            }
            this.hasTriggered = true;
        }
	}

    gobelinSpawn(){
		const out = this.hooks.random()
		if(out > 0.3) return
		const position = this.hooks.getAlliedCastle().position.clone()
		const path = this.hooks.getEnemyPath()
        this.hooks.addUnits(this.portal.recruit.toBattle(position,path,this.hooks), this)
    }

	isAlive(): boolean {
		return true;
	}

	takeDamage(_damage: number): void {
		return;
	}
}

