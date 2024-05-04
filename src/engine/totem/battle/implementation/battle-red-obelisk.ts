

import { Derive, implementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../../../shared/position";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleTotem } from "../battle-totem";
import { EvilTag } from "../../../../shared/traits/engine/tags";
import { RedObelisk } from "../../recruit/implementation/obelisk";
import { seconds } from "../../../../shared/seconds";
import { HTSynergy } from "../../../../shared/traits/engine/synergy";

export class BattleRedObelisk extends Derive(BattleTotem,EvilTag,Caster,HTSynergy) {

	hasTriggered = false;

	constructor(
		public obelisk: RedObelisk,
		readonly hooks: BattleArmyHooks,
		public readonly position: GridPosition,
		public readonly cell: Cell,
		override _orientation: number,
	) {
		super({ 
            synergy: obelisk,
            imageDrawable: obelisk, 
            hitboxHolder: obelisk , 
            casterRecruit : obelisk, 
            maxHealth: NaN,
			attack: NaN,
			attackSpeed: NaN,
			movementSpeed: NaN,
			castSpeed: obelisk.castSpeed,
			foodCost: NaN,
			onDeath: () => {}, });
		this.gridShape = obelisk.gridShape;
	}

	tick() {
        this.tickCast()
        if(!this.hasTriggered){
            this.hasTriggered = true
            const elements = this.hooks.gridHooks.getRelativeNeighborsInArmy(
                this.cell,
                this.patternEffect.getRelativeCells(this.orientation),
            );
            for(const element of elements){
                if(this.patternEffect.patternCondition(element)){
                    this.stats.basePercentStat.castSpeed += 10
                }
            }
        }
	}

    onCastResolve() {
		this.sacrifice()
		this.finishCast();
	}

	sacrifice() {
		const alliedUnit = this.hooks.getAlliedUnits()
        const random = this.hooks.random()
        const chosen = alliedUnit[(Math.floor(random * alliedUnit.length))]
        if(!chosen) return
        chosen.die()
        this.hooks.triggerFurry()
	}

	casts() {
		this.castInProgress = new Cast(this, this.onCastResolve.bind(this), seconds(5));
	}

}

