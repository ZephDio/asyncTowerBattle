import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { BattleArmy, BattleArmyHooks } from "../../army/battle/battle-army";
import { AreaEffect } from "../area-effect";


export class Explosion implements AreaEffect {
    type = 'explosion' as const
    size: Size
    constructor(public MaxSize: Size, public position: Position, public damage: number, public hooks: BattleArmyHooks) {
        this.size = { width: 1, height: 1 }
    }


    tick() {
        this.size.width++
        this.size.height++
        if (this.size.width > this.MaxSize.width) {
            console.log('removed')
            this.hooks.removeAreaEffect(this)
        }
        console.log('et coucou')
    }
}