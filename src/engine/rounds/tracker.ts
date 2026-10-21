import { Army } from "../army/army";
import { EnvironmentGeneration } from "../environment/env-generation";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { Cell } from "../../shared/position";

// Basic path tiles added to the reserve each time the grid grows.
const GRID_GROWTH_PATH_TILES = 3;

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
            this.giveGridGrowthPathTiles()
        }
        if(this.rounds === 3){
            this.alliedArmy.grid.roundThree(this.envGenerator)
            this.giveGridGrowthPathTiles()
        }
    }

    giveGridGrowthPathTiles(){
        for (let i = 0; i < GRID_GROWTH_PATH_TILES; i++) {
            const tile = new BasicPathTile(new Cell({ x: 0, y: 0 }))
            // a full reserve keeps what it has rather than failing the round change
            if (!this.alliedArmy.inventory.hasRoomFor(tile)) return
            this.alliedArmy.pushToInventory(tile)
        }
    }

    get round(){
        return this.rounds
    }

}
