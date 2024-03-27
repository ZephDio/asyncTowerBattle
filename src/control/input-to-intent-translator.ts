import { Game } from "../engine/game";
import { Physic } from "../shared/physic";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";
import { TowerBuyable } from "../engine/shop/shop";
import { TowerRecruit } from "../engine/tower/recruit/tower-recruit";
import { Tower } from "../engine/tower/entity/tower";

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
					if (Physic.doCollide(buyablePosition, buyable.entity.hitbox, position)) {
						return this.game.shop.buy(buyable);
					}
				}
				for (const hudElement of state.hudElements) {
					if (Physic.doCollide(hudElement.position, hudElement.hitbox, position)) {
						return this.game.handleShopQuit();
					}
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
			const state = this.game.shop.getState();
			for (const [buyable, buyablePosition] of state.retail.buyables) {
				if (Physic.doCollide(buyablePosition, buyable.entity.hitbox, position)) {
					return this.game.shop.setHold(buyable as TowerBuyable<TowerRecruit<Tower>>);
				}
			}
		}
	}
	translateMouseReleaseInput() {
		if (this.game.shop) {
			const state = this.game.shop.getState();
			if (state.hold) {
				this.game.shop.buy(state.hold);
				this.game.shop.setHold(null);
			}
		}
	}
}
