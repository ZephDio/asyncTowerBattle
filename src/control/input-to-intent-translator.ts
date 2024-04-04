import { Game } from "../engine/game";
import { Physic } from "../shared/physic";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";
import { Grid } from "../engine/grid/grid";
import { implementsTrait } from "@ddd-ts/traits";
import { TSynergy } from "../shared/traits/synergy";

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

			const grid = this.game.shop.army.grid;
			const cell = grid.realPositionToGrid(position);
			this.game.shop.army.grid.setOveredTile(cell);
			if (cell) {
				const gridElement = grid.tiles.get(Grid.posToString(cell));
				if (gridElement) {
					if (implementsTrait(gridElement, TSynergy)) {
						grid.setSynergiesTiles(gridElement.cell, gridElement.patternEffect, gridElement.isPatternActivated);
						return;
					}
				}
			}
			grid.clearSynergiesTiles();
		}
	}

	translateMouseDownInput(position: Position) {
		if (this.game.shop) {
			const state = this.game.shop.getState();
			if (!state.hold) {
				for (const [buyable, buyablePosition] of this.game.shop.retail.buyables) {
					if (Physic.doCollide(buyablePosition, buyable.entity.hitbox, position)) {
						return this.game.shop.setHoldFromRetail(buyable, position);
					}
				}
				for (const tower of this.game.shop.army.towers) {
					if (Physic.doCollide(this.game.shop.army.grid.cellToReal(tower.cell), tower.hitbox, position)) {
						return this.game.shop.setHoldFromArmyTower(tower, position);
					}
				}
				for (const tile of this.game.shop.army.path.tiles) {
					if (Physic.doCollide(this.game.shop.army.grid.cellToReal(tile.cell), tile.hitbox, position)) {
						return this.game.shop.setHoldFromArmyTiles(tile, position);
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
