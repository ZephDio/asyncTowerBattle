import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { BattleArmy } from "../army/battle/battle-army";
import { AnyBattleTower } from "../constructs/tower/battle/battle-tower";
import { ArmyGrid } from "./grid";
import { AnyBattleTile } from "../tile/battle/battle-tile";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { TRenderable } from "../../shared/traits/render/renderable";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TEnvironmentElement } from "../environment/environment";
import { AnyBattleCastle } from "../castle/battle";
import { flipCell } from "../../shared/traits/engine/core/board-orientation";

export type BattleGridElement =
	| AnyBattleTower
	| AnyBattleTile
	| AnyBattleCastle
	| ImplementsTrait<typeof TEnvironmentElement>;
export class BattleGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, BattleGridElement> = new Map();
	// The castles stand off the board, beside the top rows, so they are not in `tiles`. See castle-geometry.ts.
	castles: AnyBattleCastle[] = [];
	hoverEffect: HoverEffect[];
	synergiesEffects: SynergyEffectHud[] = [];
	constructor(
		public gridAllied: ArmyGrid,
		public gridEnemy: ArmyGrid,
		width: number,
		height: number,
		cellSize = 5,
		screenPosition = PercentToReal({ x: 50, y: 50 }),
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	static fuse(gridAllied: ArmyGrid, gridEnemy: ArmyGrid): BattleGrid {
		if (gridAllied.width !== gridEnemy.width || gridAllied.height !== gridEnemy.height) {
			throw new Error("cannot fuse grid with different grid size");
		}
		const battleGrid = new BattleGrid(
			gridAllied,
			gridEnemy,
			gridAllied.width,
			gridAllied.height + gridEnemy.height,
			gridAllied.cellSize,
		);
		return battleGrid;
	}

	initElements(
		alliedArmy: BattleArmy,
		enemyArmy: BattleArmy,
		environmentElements: ImplementsTrait<typeof TEnvironmentElement>[],
	) {
		this.castles = [alliedArmy.castle, enemyArmy.castle];
		const gridElements = [
			...alliedArmy.towers,
			...alliedArmy.tiles,
			...alliedArmy.barracks,
			...alliedArmy.totems,
			...enemyArmy.towers,
			...enemyArmy.tiles,
			...enemyArmy.barracks,
			...environmentElements,
			...enemyArmy.totems,
		];
		for (const gridElement of gridElements) {
			this.setElement(gridElement);
		}
	}

	override getDrawables() {
		return [...super.getDrawables(), ...this.castles];
	}

	// The relative positions are already mirrored by the piece's board orientation.
	getRelativeNeighborsInArmy(armyGridPosition: Cell, relativePositions: Cell[]) {
		const founds: (BattleGridElement | undefined)[] = [];
		for (const relativePosition of relativePositions) {
			const targetPosition = armyGridPosition.add(relativePosition);
			const elementFound = this.tiles.get(ArmyGrid.posToString(targetPosition));
			founds.push(elementFound && founds.includes(elementFound) ? undefined : elementFound);
		}
		return founds;
	}

	getRelativeNeighborsInBattle(cell: Cell, relativePositions: Cell[]) {
		const founds: BattleGridElement[] = [];
		for (const relativePosition of relativePositions) {
			const targetPosition = cell.add(relativePosition);
			const elementFound = this.tiles.get(ArmyGrid.posToString(targetPosition));
			if (elementFound && !founds.includes(elementFound)) {
				founds.push(elementFound);
			}
		}
		return founds;
	}

	getRelativeDirection(isEnemy: boolean) {
		if (!isEnemy) {
			return {
				above: new GridPosition({ x: 0, y: 1 }),
				below: new GridPosition({ x: 0, y: -1 }),
				left: new GridPosition({ x: -1, y: 0 }),
				right: new GridPosition({ x: 1, y: 0 }),
			};
		}
		return {
			above: new GridPosition({ x: 0, y: -1 }),
			below: new GridPosition({ x: 0, y: 1 }),
			left: new GridPosition({ x: 1, y: 0 }),
			right: new GridPosition({ x: -1, y: 0 }),
		};
	}

	getBoundaries() {
		return {
			minX: 0,
			minY: 0,
			maxX: this.width * STANDARD_CELL_SIZE,
			maxY: this.height * STANDARD_CELL_SIZE,
		};
	}

	getAlliedHooks(): GridHooks {
		return {
			getRealPosition: this.cellToGrid.bind(this),
			getCell: this.gridPositionToCell.bind(this),
			getRelativeNeighborsInArmy: this.getRelativeNeighborsInArmy.bind(this),
			getRelativeNeighborsInBattle: this.getRelativeNeighborsInBattle.bind(this),
			getRelativeDirection: () => this.getRelativeDirection(false),
			getBoundaries: () => this.getBoundaries(),
		};
	}

	getEnemyHooks(): GridHooks {
		return {
			getRealPosition: this.cellToGrid.bind(this),
			getCell: this.gridPositionToCell.bind(this),
			getRelativeNeighborsInArmy: this.getRelativeNeighborsInArmy.bind(this),
			getRelativeNeighborsInBattle: this.getRelativeNeighborsInBattle.bind(this),
			getRelativeDirection: () => this.getRelativeDirection(true),
			getBoundaries: () => this.getBoundaries(),
		};
	}

	static flip(battleGrid: BattleGrid, cell: Cell) {
		return flipCell(cell, battleGrid.width, battleGrid.height);
	}
}

export type GridHooks = {
	getRealPosition: (cell: Cell) => GridPosition;
	getCell: (position: GridPosition) => Cell | undefined;
	getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => (BattleGridElement | undefined)[];
	getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => (BattleGridElement | undefined)[];
	getRelativeDirection: () => { above: GridPosition; below: GridPosition; left: GridPosition; right: GridPosition };
	getBoundaries: () => { minX: number; minY: number; maxX: number; maxY: number };
};
