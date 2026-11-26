import { ArmyGrid } from "../../engine/grid/grid";
import { ShopPhase } from "../../engine/shop/shop";
import { RefreshBellHud } from "../../shared/hud-element/refresh-bell-hud";
import { StartBattleButton } from "../../shared/hud-element/start-battle-button";
import { ScreenPosition } from "../../shared/position";
import { MouseEventType } from "../mouse-event-handler";
import { ShopState } from "../../shared/gamestate";
import { ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { TGrid } from "../../engine/grid/tgrid";
import { TRecruit } from "../../shared/traits/engine/recruit";
import { DescriptionHud, TDescriptor } from "../../shared/traits/render/huds/item-descriptor";
import { TSynergy } from "../../shared/traits/engine/synergy";
import { TTargeting } from "../../shared/traits/engine/targeting";
import { Inventory } from "../../engine/grid/inventory/unit-inventory";
import { RetailGrid } from "../../engine/grid/retail-grid";
import { Buyable } from "../../engine/shop/retail/buyable";
import { PathTile } from "../../engine/tile/recruit/tile";
import { Trap } from "../../engine/trap/recruit/trap";
import { BoardOrientation } from "../../shared/traits/engine/core/board-orientation";
import { Barrack } from "../../engine/constructs/barrack/recruit/barrack";
import { ArmyHud } from "../../shared/hud-element/army-hud";
import { ScienceHud } from "../../shared/hud-element/science-hud";
import { SciencePanel } from "../../shared/hud-element/science-panel";

export class ShopInputToIntentTranslator {
	handle(screenPosition: ScreenPosition, eventType: MouseEventType, shop: ShopPhase) {
		shop.signHovered = shop.sign.contains(screenPosition);
		if (this.handleSciences(screenPosition, eventType, shop)) return;
		const state = shop.getState();
		if (eventType === "move" && !shop.holderControl.hold && shop.army.grid.isOverCastle(screenPosition)) {
			// The castle stands off the grid, so it is hovered apart from the cells.
			this.clearHover(shop);
			shop.setDescriptionHud(new DescriptionHud(shop.army.castle));
			return;
		}
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
			this.handleMouseRightClick(shop, focus);
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
		if (!focus || focus instanceof ArmyHud || focus instanceof ScienceHud) return;
		if (shop.holderControl.hold) return;
		if (focus.cell && (focus.grid instanceof ArmyGrid || focus.grid instanceof Inventory)) {
			const element = this.trapOr(focus.element, focus.grid, screenPosition);
			if (element && implementsTrait(element, TRecruit) && !this.isLockedTile(element, focus.grid)) {
				shop.setHoldFromArmyRecruit(element, screenPosition, focus.grid);
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
		if (focus instanceof ScienceHud) {
			this.clearHover(shop);
			shop.setDescriptionHud(null);
			return;
		}
		if (focus instanceof ArmyHud) {
			this.clearHover(shop);
			const described = shop.holderControl.hold ? null : focus.describedAt(screenPosition);
			if (described) {
				shop.setDescriptionHud(new DescriptionHud(described));
			} else {
				shop.setDescriptionHud(null);
			}
			return;
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
				const gridPosition = focus.grid.screenToGridPosition(screenPosition);
				const projectionCells = shop.holderControl.hold.getProjectionCells(gridPosition);
				focus.grid.setOveredTile(projectionCells);
				if (patternEffect && projectionCells[0]) {
					focus.grid.setSynergiesTiles(
						projectionCells[0],
						patternEffect.getRelativeCells(BoardOrientation.Normal),
						patternEffect.patternCondition,
					);
				}
				const targetZone = shop.holderControl.hold.getTargetZone();
				if (targetZone && projectionCells[0]) {
					focus.grid.addTargetTiles(projectionCells[0], targetZone, BoardOrientation.Normal);
				}

				return;
			}
			if (focus.element) {
				const described = this.unitOr(focus.element, focus.grid, screenPosition);
				if (described === focus.element && implementsTrait(focus.element, TSynergy)) {
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
				if (implementsTrait(focus.element, TTargeting)) {
					focus.grid.setOveredTile([
						...focus.element.gridShape.getOccupiedCellsFrom(focus.element.cell, focus.element.orientation),
					]);
					focus.grid.addTargetTiles(focus.element.cell, focus.element.targetZone, focus.element.orientation);
				}
				if (implementsTrait(described, TDescriptor)) {
					shop.setDescriptionHud(new DescriptionHud(described));
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
				const gridPosition = focus.grid.screenToGridPosition(screenPosition);
				const projectionCells = shop.holderControl.hold.getProjectionCells(gridPosition);
				focus.grid.setOveredTile(projectionCells);
			}
			if (focus.element) {
				focus.grid.setOveredTile([
					...focus.element.gridShape.getOccupiedCellsFrom(focus.element.cell, focus.element.orientation),
				]);
				const described = this.trapOr(focus.element, focus.grid, screenPosition);
				if (implementsTrait(described, TDescriptor)) {
					shop.setDescriptionHud(new DescriptionHud(described));
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
		if (
			!focus ||
			focus instanceof RefreshBellHud ||
			focus instanceof StartBattleButton ||
			focus instanceof ArmyHud ||
			focus instanceof ScienceHud
		) {
			shop.holderControl.hold.onRelease();
			return;
		}
		const gridPosition = focus.grid.screenToGridPosition(screenPosition);
		shop.holderControl.hold.onRelease(gridPosition, focus.grid);
	}

	handleMouseRightClick(shop: ShopPhase, focus: ReturnType<ShopInputToIntentTranslator["determinateFocus"]>) {
		if (shop.holderControl.hold) return;
		if (
			focus &&
			!(focus instanceof RefreshBellHud) &&
			!(focus instanceof StartBattleButton) &&
			!(focus instanceof ArmyHud) &&
			!(focus instanceof ScienceHud)
		) {
			if (focus.grid instanceof ArmyGrid && focus.element && implementsTrait(focus.element, PathTile)) {
				shop.army.cyclePathAt(focus.element.cell);
			}
			if (focus.grid instanceof RetailGrid && focus.element instanceof Buyable) {
				shop.toggleReservation(focus.element);
			}
		}
	}

	// The science seals and the scroll they open come before the rest of the shop, which the scroll covers. Returns
	// whether the event was theirs.
	handleSciences(screenPosition: ScreenPosition, eventType: MouseEventType, shop: ShopPhase) {
		const holding = !!shop.holderControl.hold;
		const science = holding ? null : shop.getScienceHud().scienceAt(screenPosition);
		if (eventType === "move") {
			shop.sciencePanel?.clearHover();
			shop.hoveredScience = science;
		}
		if (science) {
			if (eventType === "down") shop.toggleScience(science);
			this.clearHover(shop);
			shop.setDescriptionHud(null);
			return true;
		}
		const panel = shop.sciencePanel;
		if (panel && !holding && panel.contains(screenPosition)) {
			shop.signHovered = false;
			if (eventType === "move") this.hoverSciencePanel(shop, panel, screenPosition);
			return true;
		}
		if (eventType === "down" && shop.pinnedScience) shop.closeSciencePanel();
		return false;
	}

	// Over a piece of a science's scroll: its description, and its pattern and target cells on the scroll's grid.
	hoverSciencePanel(shop: ShopPhase, panel: SciencePanel, screenPosition: ScreenPosition) {
		this.clearHover(shop);
		const element = panel.elementAt(screenPosition);
		if (!element) {
			shop.setDescriptionHud(null);
			return;
		}
		const grid = panel.grid;
		grid.setOveredTile([...element.gridShape.getOccupiedCellsFrom(element.cell, element.orientation)]);
		if (implementsTrait(element, TSynergy)) {
			const { patternEffect } = element;
			grid.setSynergiesTiles(
				element.cell,
				patternEffect.getRelativeCells(element.orientation),
				patternEffect.patternCondition,
			);
		}
		if (implementsTrait(element, TTargeting)) {
			grid.addTargetTiles(element.cell, element.targetZone, element.orientation);
		}
		shop.setDescriptionHud(implementsTrait(element, TDescriptor) ? new DescriptionHud(element) : null);
	}

	clearHover(shop: ShopPhase) {
		shop.army.grid.clearSynergiesTiles();
		shop.army.grid.setOveredTile(null);
		shop.army.inventory.setOveredTile([]);
	}

	// The tile on the army grid's locked cell stays put. A trap it carries is not locked and can still be grabbed.
	isLockedTile(element: ImplementsTrait<typeof TRecruit>, grid: ImplementsTrait<typeof TGrid>) {
		if (!(grid instanceof ArmyGrid)) return false;
		if (implementsTrait(element, Trap)) return false;
		return grid.isLocked(element);
	}

	// Over the unit put on a barrack, hovering describes that unit, as the unit is grabbed from there.
	unitOr<T>(element: T, grid: ImplementsTrait<typeof TGrid>, screenPosition: ScreenPosition) {
		if (element && implementsTrait(element, Barrack)) {
			const unit = element.unitAt(grid, grid.screenToGridPosition(screenPosition));
			if (unit) return unit;
		}
		return this.trapOr(element, grid, screenPosition);
	}

	// On a path tile carrying a trap, the middle of the tile stands for the trap: clicking there grabs only the trap
	// and hovering describes it. The rest of the tile grabs the tile with its trap.
	trapOr<T>(element: T, grid: ImplementsTrait<typeof TGrid>, screenPosition: ScreenPosition) {
		if (!element || !implementsTrait(element, PathTile)) return element;
		return element.trapAt(grid.screenToGridPosition(screenPosition), grid) ?? element;
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
			if (hudElement instanceof ArmyHud && hudElement.contains(screenPosition)) {
				return hudElement;
			}
			if (hudElement instanceof ScienceHud && hudElement.sciences.length > 0 && hudElement.contains(screenPosition)) {
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
