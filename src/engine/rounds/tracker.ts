import { Army } from "../army/army";
import { EnvironmentGeneration } from "../environment/env-generation";


export class RoundsTracker{

    constructor(public alliedArmy : Army,public envGenerator : EnvironmentGeneration){}

    rounds = 0


    update(){
        this.rounds++
        if(this.rounds === 1){
            this.alliedArmy.grid.roundOne(this.envGenerator)
        }
        if(this.rounds === 2){
            this.alliedArmy.grid.roundTwo(this.envGenerator)
        }
        if(this.rounds === 3){
            this.alliedArmy.grid.roundThree(this.envGenerator)
        }
    }

    get round(){
        return this.rounds
    }

}