import { Game } from "../engine/game";
import { Physic } from "../shared/physic";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";
import { TowerBuyable } from "../engine/shop/shop";

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
			const state = this.game.shop.getState();
			for (const hudElement of state.hudElements) {
				if (Physic.doCollide(hudElement.position, hudElement.hitbox, position)) {
					return this.game.handleShopQuit();
				}
			}
		}
		return;
	}

	translateMouseMoveInput(position: Position) {
		if (this.game.shop) {
			if (this.game.shop.hold) {
				this.game.shop.moveHold(position);
			}
		}
	}

	translateMouseDownInput(position: Position) {
		if (this.game.shop) {
			const state = this.game.shop.getState2();
			if (!state.hold) {
				for (const [buyable, buyablePosition] of state.retail.buyables) {
					if (Physic.doCollide(buyablePosition, buyable.entity.hitbox, position)) {
						return this.game.shop.setHoldFromRetail(buyable as TowerBuyable, position);
					}
				}
				for (const tower of state.towers) {
					if (Physic.doCollide(state.grid.gridPositionToReal(tower.gridPosition), tower.hitbox, position)) {
						return this.game.shop.setHoldFromArmy(tower, position);
					}
				}
			}
		}
	}
	translateMouseReleaseInput(position: Position) {
		if (this.game.shop) {
			const state = this.game.shop.getState();
			if (state.hold) {
				state.hold.onRelease(position);
			}
		}
	}
}
