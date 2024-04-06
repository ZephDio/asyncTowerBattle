import { Game } from "../engine/game";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";
import { ArmyGrid } from "../engine/grid/grid";
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
				if (hudElement.contains(position)) {
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

			// ArmyGrid
			const grid = this.game.shop.army.grid;
			const cell = grid.realPositionToGrid(position);
			grid.setOveredTile(cell);
			if (cell) {
				if (this.game.shop.hold) {
					const synergy = this.game.shop.hold.getSynergies();
					if (synergy) {
						grid.setSynergiesTiles(cell, synergy.patternEffect, synergy.isPatternActivated);
						return;
					}
				} else {
					const gridElement = grid.tiles.get(ArmyGrid.posToString(cell));
					if (gridElement) {
						if (implementsTrait(gridElement, TSynergy)) {
							const synergy = gridElement.getSynergies();
							grid.setSynergiesTiles(gridElement.cell, synergy.patternEffect, synergy.isPatternActivated);
							return;
						}
					}
				}
			}

			// UnitInventoryGrid
			const uigrid = this.game.shop.army.unitInventory;
			const uicell = uigrid.realPositionToGrid(position);
			uigrid.setOveredTile(uicell);
			if (uicell) {
			}

			grid.clearSynergiesTiles();
		}
	}

	translateMouseDownInput(position: Position) {
		if (this.game.shop) {
			const state = this.game.shop.getState();
			if (!state.hold) {
				for (const [buyable] of this.game.shop.retail.buyables) {
					if (buyable.contains(position)) {
						return this.game.shop.setHoldFromRetail(buyable, position);
					}
				}
				for (const gridElement of this.game.shop.army.getRecruits()) {
					if (gridElement.contains(position, this.game.shop.army.grid)) {
						return this.game.shop.setHoldFromArmyRecruit(gridElement, position);
					}
				}
				for (const gridElement of this.game.shop.army.unitInventory.getUnits()) {
					if (gridElement.contains(position, this.game.shop.army.unitInventory)) {
						return this.game.shop.setHoldFromUnitInventory(gridElement, position);
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
