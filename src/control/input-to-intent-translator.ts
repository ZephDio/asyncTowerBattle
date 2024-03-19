import { Game } from "../engine/game";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";

export interface PlayerIntent {
  intent: string;
}

export class InputToIntentTranslator {
  intents: PlayerIntent[] = [];
  game: Game;
  constructor(private readonly renderer: CanvasRenderer) {
    this.game = this.renderer.game;
  }

  // async translateClickInput(position: Position): Promise<void> {
  //   if (await this.playerDidClickOnTower(position)) {
  //     this.intents.push({ intent: "TowerClicked" });
  //     return;
  //   }
  //   this.intents.push({ intent: "No Intent" });
  // }

  //   async playerDidClickOnTower(mousePosition: Position) {
  //     const state = await this.game.getState();
  //     for (const tower of state.towers) {
  //       for (const hitShape of tower.hitbox.hitShapes) {
  //         if (Entity.doCollide(tower, mousePosition)) {
  //           console.log(tower.type);
  //           return tower;
  //         }
  //       }
  //     }
  //     return undefined;
  //   }
}
