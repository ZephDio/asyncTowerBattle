import { Game } from "../engine/game";
import { PhysicEntity } from "../shared/physic";
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

  translateClickInput(position: Position): void {
    if (this.game.battleSummary) {
      this.game.battleSummary.quitSummary();
      return;
    }
    if (this.game.shop) {
      if (this.game.shop) {
        const state = this.game.shop.getState();
        for (const [buyable, buyablePosition] of state.retail.buyables) {
          if (PhysicEntity.doCollide(buyablePosition, buyable.entity.hitbox, position)) {
            return this.game.shop.buy(buyable);
          }
        }
        for (const hudElement of state.hudElements) {
          if (PhysicEntity.doCollide(hudElement.position, hudElement.hitbox, position)) {
            return this.game.handleShopQuit();
          }
        }
      }
    }
    return;
  }

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
