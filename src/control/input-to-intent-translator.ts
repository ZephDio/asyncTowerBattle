import { Game } from "../engine/game";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";

export interface PlayerIntent {
  intent: string
}

export class InputToIntentTranslator {
  intents: PlayerIntent[] = []
  game: Game
  constructor(private readonly renderer: CanvasRenderer){
    this.game = this.renderer.game
  }

  async translateClickInput(position: Position): Promise<void>{
    if(await this.playerDidClickOnTower(position)){
      this.intents.push({intent : "TowerClicked"})
      console.log(this.intents)
      return
    }
    this.intents.push({intent : "No Intent"})
    console.log(this.intents)
  }

  async playerDidClickOnTower(mousePosition: Position){
    const state = await this.game.getState()
    console.log('tower :' ,state.towers[0].position)
    for(const tower of state.towers){
      const mouseOnTowerX = (mousePosition.x > tower.position.x  && mousePosition.x < tower.position.x +5)
      const mouseOnTowerY = (mousePosition.y < tower.position.y && mousePosition.y > tower.position.y - (5* (16/7.53)))
      const mouseOnTower =  mouseOnTowerX && mouseOnTowerY
      if(mouseOnTower) return true
    }
  }

}