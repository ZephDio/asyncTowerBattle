import { Size } from "../../../shared/size";
import { BattleArmy } from "../../army/battle/battle-army";
import { Battlefield } from "../../battle/battlefield/battlefield";
import { AreaEffect } from "../area-effect";


export class Explosion implements AreaEffect {
    type = 'explosion' as const
    size: Size
    constructor(public MaxSize: Size, onFinish: BattleArmy["removeAreaEffect"]) {
        this.size = { width: 1, height: 1 }
    }


    tick() {

        console.log('et coucou')
    }
}