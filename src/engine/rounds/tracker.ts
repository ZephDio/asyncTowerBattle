import { Army } from "../army/army";


export class RoundsTracker{

    constructor(public alliedArmy : Army){}

    rounds = 1


    update(){
        this.rounds++
        if(this.rounds === 2){
            this.alliedArmy.grid.roundTwo()
        }
    }

    get round(){
        return this.rounds
    }

}