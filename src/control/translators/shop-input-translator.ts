import { ArmyGrid } from "../../engine/grid/grid";
import { ShopPhase } from "../../engine/shop/shop";
import { RefreshBellHud } from "../../shared/hud-element/refresh-bell-hud";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { ShopState } from "../../shared/gamestate";
import { implementsTrait } from "@ddd-ts/traits";
import { TRecruit } from "../../shared/traits/engine/recruit";
import { DescriptionHud, TDescriptor } from "../../shared/traits/render/huds/item-descriptor";
import { TSynergy } from "../../shared/traits/engine/synergy";
import { Inventory } from "../../engine/grid/inventory/unit-inventory";
import { RetailGrid } from "../../engine/grid/retail-grid";
import { Buyable } from "../../engine/shop/retail/buyable";

export class ShopInputToIntentTranslator {
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, shop: ShopPhase) {
		const state = shop.getState();
		const focus = this.determinateFocus(shop, state, screenPosition);
		if (eventType === "move") {
			this.handleMouseMove(shop, focus, screenPosition);
			return;
		}
		if (eventType === "down") {
			this.handleMouseDown(shop, focus, screenPosition);
			return;
		}
		if (eventType === "up") {
			this.handleMouseUp(shop, focus, screenPosition);
			return;
		}
		if (eventType === "right-click") {
			this.handleMouseRightClick(shop, focus, screenPosition);
		}
	}

	handleMouseDown(
		shop: ShopPhase,
		focus: ReturnType<ShopInputToIntentTranslator["determinateFocus"]>,
		screenPosition: ScreenPosition,
	) {
		if (focus instanceof RefreshBellHud) {
			shop.refresh();
			return;
		}
		if (focus instanceof StartBattleButton) {
			shop.exitShop();
			return;
		}
		if (!focus) return;
		if(shop.holderControl.hold) return
		if (focus.cell && focus.grid instanceof ArmyGrid) {
			if (focus.element && implementsTrait(focus.element, TRecruit)) {
				shop.setHoldFromArmyRecruit(focus.element, screenPosition, focus.grid);
			}
		}
		if (focus.cell && focus.grid instanceof Inventory) {
			if (focus.element && implementsTrait(focus.element, TRecruit)) {
				shop.setHoldFromArmyRecruit(focus.element, screenPosition, focus.grid);
			}
		}
		if (focus.cell && focus.grid instanceof RetailGrid) {
			if (focus.element && focus.element instanceof Buyable) {
				shop.selectItemFromRetail(focus.element, screenPosition);
			}
		}
	}

	handleMouseMove(
		shop: ShopPhase,
		focus: ReturnType<ShopInputToIntentTranslator["determinateFocus"]>,
		screenPosition: ScreenPosition,
	) {
		if (shop.holderControl.hold) {
			shop.holderControl.moveHold(screenPosition);
		}
		if (!focus || focus instanceof RefreshBellHud || focus instanceof StartBattleButton) {
			shop.setDescriptionHud(null);
			shop.army.grid.clearSynergiesTiles();
			shop.army.grid.setOveredTile(null);
			shop.army.inventory.setOveredTile([]);
			return;
		}
		if (focus.cell && focus.grid instanceof ArmyGrid) {
			focus.grid.clearSynergiesTiles();
			focus.grid.setOveredTile([focus.cell]);
			if (shop.holderControl.hold) {
				const patternEffect = shop.holderControl.hold.getPatternEffect();
				if (patternEffect) {
					focus.grid.setSynergiesTiles(
						focus.cell,
						patternEffect.getRelativeCells(shop.holderControl.hold.orientation),
						patternEffect.patternCondition,
					);
				}
				const projectionCells = shop.holderControl.hold.getProjectionCells(focus.cell);
				focus.grid.setOveredTile(projectionCells);
				return;
			}
			if (focus.element) {
				if (implementsTrait(focus.element, TSynergy)) {
					const patternEffect = focus.element.patternEffect;
					const condition = patternEffect.patternCondition;
					focus.grid.setOveredTile([
						...focus.element.gridShape.getOccupiedCellsFrom(focus.element.cell, focus.element.orientation),
					]);
					focus.grid.setSynergiesTiles(
						focus.element.cell,
						patternEffect.getRelativeCells(focus.element.orientation),
						condition,
					);
				}
				if (implementsTrait(focus.element, TDescriptor)) {
					shop.setDescriptionHud(new DescriptionHud(focus.element));
				}
				return;
			}
			shop.setDescriptionHud(null);
			shop.army.grid.clearSynergiesTiles();
			shop.army.inventory.setOveredTile(null);
		}
		if (focus.cell && focus.grid instanceof Inventory) {
			focus.grid.setOveredTile([focus.cell]);
			if (shop.holderControl.hold) {
				return;
			}
			if (focus.element) {
				focus.grid.setOveredTile([
					...focus.element.gridShape.getOccupiedCellsFrom(focus.element.cell, focus.element.orientation),
				]);
				if (implementsTrait(focus.element, TDescriptor)) {
					shop.setDescriptionHud(new DescriptionHud(focus.element));
				}
				return;
			}
			shop.setDescriptionHud(null);
			shop.army.grid.clearSynergiesTiles();
			shop.army.grid.setOveredTile(null);
		}
		if (focus.cell && focus.grid instanceof RetailGrid) {
			if (shop.holderControl.hold) {
				return;
			}
			if (focus.element) {
				if (implementsTrait(focus.element, TDescriptor)) {
					shop.setDescriptionHud(new DescriptionHud(focus.element));
				}
				return;
			}
			shop.setDescriptionHud(null);
			shop.army.grid.clearSynergiesTiles();
			shop.army.grid.setOveredTile(null);
			shop.army.inventory.setOveredTile(null);
		}
		return;
	}

	handleMouseUp(
		shop: ShopPhase,
		focus: ReturnType<ShopInputToIntentTranslator["determinateFocus"]>,
		screenPosition: ScreenPosition,
	) {
		if (!shop.holderControl.hold) return;
		if (!focus || focus instanceof RefreshBellHud || focus instanceof StartBattleButton) {
			shop.holderControl.hold.onRelease();
			return;
		}
		const gridPosition = focus.grid.screenToGridPosition(screenPosition);
		shop.holderControl.hold.onRelease(gridPosition, focus.grid);
	}

	handleMouseRightClick(
		shop: ShopPhase,
		focus: ReturnType<ShopInputToIntentTranslator["determinateFocus"]>,
		screenPosition: ScreenPosition,
	) {
		if (shop.holderControl.hold) {
			shop.holderControl.hold.rotate();
			this.handleMouseMove(shop, focus, screenPosition);
		}
	}

	determinateFocus(shop: ShopPhase, state: ShopState, screenPosition: ScreenPosition) {
		for (const hudElement of state.hudElements) {
			if (hudElement instanceof StartBattleButton && hudElement.contains(screenPosition)) {
				// TODO
				return hudElement;
			}
			if (hudElement instanceof RefreshBellHud && hudElement.contains(screenPosition)) {
				return hudElement;
			}
		}
		const grid = shop.determineGrid(screenPosition);
		if (!grid) return;
		const gridPosition = grid.screenToGridPosition(screenPosition);
		const cell = grid.gridPositionToCell(gridPosition);
		if (!cell) return;
		return {
			element: grid.getElement(cell),
			grid,
			cell,
		};
	}
}


