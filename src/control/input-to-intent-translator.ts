import { Game } from "../engine/game";
import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../shared/position";
import { ArmyGrid } from "../engine/grid/grid";
import { implementsTrait } from "@ddd-ts/traits";
import { TSynergy } from "../shared/traits/engine/synergy";
import { StartBattleButton } from "../shared/hud-element/start-battle-button";
import { RefreshBellHud } from "../shared/hud-element/refresh-bell-hud";
import { RetailGrid } from "../engine/grid/retail-grid";
import { Inventory } from "../engine/grid/inventory/unit-inventory";
import { ButtonSpeedHUD } from "../shared/hud-element/battle/button-speed";
import { DescriptionHud, TDescriptor } from "../shared/traits/render/huds/item-descriptor";
import { MouseEventType } from "./mouse-event-handler";
import { Battle } from "../engine/battle/battle";
import { ShopPhase } from "../engine/shop/shop";
import { BattleSummary } from "../engine/battle-summary/battle-summary";
import { ShopInputToIntentTranslator } from "./translators/shop-input-translator";
import { BattleInputToIntentTranslator } from "./translators/battle-input-translator";
import { BattleSummaryInputToIntentTranslator } from "./translators/battlesummary-input-translator";

export interface PlayerIntent {
	intent: string;
}

ArmyGrid;
// export class InputToIntentTranslator {
// 	intents: PlayerIntent[] = [];
// 	game: Game;
// 	constructor(private readonly renderer: CanvasRenderer) {
// 		this.game = this.renderer.game;
// 	}

// 	translateClickInput(position: ScreenPosition): void {
// 		if (this.game.battleSummary) {
// 			this.game.battleSummary.quitSummary();
// 			return;
// 		}
// 		if (this.game.shop) {
// 			const state = this.game.shop.getState();
// 			for (const hudElement of state.hudElements) {
// 				if (hudElement instanceof StartBattleButton && hudElement.contains(position)) {
// 					return this.game.handleShopQuit();
// 				}
// 				if (hudElement instanceof RefreshBellHud && hudElement.contains(position)) {
// 					this.game.shop.refresh();
// 					return;
// 				}
// 			}
// 		}

// 		if (this.game.battle) {
// 			const state = this.game.battle.getState();
// 			if (state.hudElements) {
// 				for (const hudElement of state.hudElements) {
// 					if (hudElement instanceof ButtonSpeedHUD && hudElement.contains(position)) {
// 						return this.game.battle.changeSpeed(hudElement.speed);
// 					}
// 				}
// 			}
// 		}
// 		return;
// 	}

// 	translateMouseMoveInput(position: ScreenPosition) {
// 		let clear = false;
// 		if (this.game.shop) {
// 			if (this.game.shop.holderControl.hold) {
// 				this.game.shop.holderControl.moveHold(position);
// 			}

// 			const grid = this.game.shop.determineGrid(position);
// 			// ArmyGrid
// 			// const grid = this.game.shop.army.grid;
// 			if (grid) {
// 				const gridPosition = grid.screenToGridPosition(position);
// 				const cell = grid.gridPositionToCell(gridPosition) ?? null;
// 				if (grid instanceof ArmyGrid) {
// 					grid.setOveredTile(cell);
// 					if (cell) {
// 						if (this.game.shop.holderControl.hold) {
// 							const synergy = this.game.shop.holderControl.hold.getSynergies();
// 							if (synergy) {
// 								grid.setSynergiesTiles(cell, synergy.patternEffect, synergy.isPatternActivated);
// 								clear = true;
// 							}
// 						} else {
// 							const gridElement = grid.tiles.get(ArmyGrid.posToString(cell));
// 							if (gridElement) {
// 								if (implementsTrait(gridElement, TDescriptor)) {
// 									this.game.descriptionHud = new DescriptionHud(gridElement);
// 									clear = true;
// 								} else {
// 									this.game.descriptionHud = null;
// 								}
// 								if (implementsTrait(gridElement, TSynergy)) {
// 									const synergy = gridElement.getSynergies();
// 									grid.setSynergiesTiles(gridElement.cell, synergy.patternEffect, synergy.isPatternActivated);
// 									clear = true;
// 								}
// 							}
// 						}
// 					}
// 				}
// 				if (grid instanceof Inventory) {
// 					grid.setOveredTile(cell);
// 					if (cell) {
// 						if (this.game.shop.holderControl.hold) {
// 						} else {
// 							const gridElement = grid.tiles.get(ArmyGrid.posToString(cell));
// 							if (gridElement) {
// 								if (implementsTrait(gridElement, TDescriptor)) {
// 									this.game.descriptionHud = new DescriptionHud(gridElement);
// 								} else {
// 									this.game.descriptionHud = null;
// 								}
// 							}
// 						}
// 					}
// 				}
// 			} else {
// 				this.game.army.grid.setOveredTile(null);
// 				this.game.army.inventory.setOveredTile(null);
// 				this.game.descriptionHud = null;
// 			}
// 			// const uicell = uigrid.gridPositionToCell(position);
// 			// uigrid.setOveredTile(uicell);
// 			// if (uicell) {
// 			// }
// 		}
// 	}

// 	translateMouseDownInput(screenPosition: ScreenPosition) {
// 		if (this.game.shop) {
// 			const state = this.game.shop.getState();
// 			if (!state.hold) {
// 				const grid = this.game.shop.determineGrid(screenPosition);
// 				if (!grid) return;
// 				if (grid instanceof RetailGrid) {
// 					for (const buyable of this.game.shop.retail.grid.getBuyables()) {
// 						const position = grid.screenToGridPosition(screenPosition);
// 						if (buyable.contains(position, this.game.shop.retail.grid)) {
// 							return this.game.shop.selectItemFromRetail(buyable, screenPosition);
// 						}
// 					}
// 				}
// 				if (grid instanceof Inventory) {
// 					for (const gridElement of this.game.shop.army.inventory.getRecruits()) {
// 						const position = grid.screenToGridPosition(screenPosition);
// 						if (gridElement.contains(position, this.game.shop.army.inventory)) {
// 							return this.game.shop.setHoldFromArmyRecruit(gridElement, screenPosition, grid);
// 						}
// 					}
// 				}
// 				if (grid instanceof ArmyGrid) {
// 					for (const gridElement of this.game.shop.army.grid.getRecruits()) {
// 						const position = grid.screenToGridPosition(screenPosition);
// 						if (gridElement.contains(position, this.game.shop.army.grid)) {
// 							return this.game.shop.setHoldFromArmyRecruit(gridElement, screenPosition, grid);
// 						}
// 					}
// 				}
// 			}
// 		}
// 	}
// 	translateMouseReleaseInput(screenPosition: ScreenPosition) {
// 		if (this.game.shop) {
// 			const state = this.game.shop.getState();
// 			if (state.hold) {
// 				const grid = this.game.shop.determineGrid(screenPosition);
// 				const gridPosition = grid?.screenToGridPosition(screenPosition);
// 				state.hold.onRelease(gridPosition, grid);
// 			}
// 		}
// 	}
// }

export class InputToIntent {
	battleTranslator = new BattleInputToIntentTranslator();
	shopTranslator = new ShopInputToIntentTranslator();
	battleSummaryTranslator = new BattleSummaryInputToIntentTranslator();
	constructor(public game: Game) {}

	handle(screenPosition: ScreenPosition, eventType: MouseEventType) {
		//this.isGameAction() TODO
		const phase = this.determinatePhase(this.game);
		if (phase instanceof Battle) {
			this.battleTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof ShopPhase) {
			this.shopTranslator.handle(screenPosition, eventType, phase);
		}
		if (phase instanceof BattleSummary) {
			this.battleSummaryTranslator.handle(screenPosition, eventType, phase);
		}
	}
	determinatePhase(game: Game) {
		if (game.battle) {
			return game.battle;
		}
		if (game.shop) {
			return game.shop;
		}
		if (game.battleSummary) {
			return game.battleSummary;
		}
		throw new Error("No Active Phase");
	}
}
