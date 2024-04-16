import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { Cell, GridPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleCastle } from "../castle/battle/battle-castle";
import { AnyBattleTower } from "../tower/battle/battle-tower";
import { ArmyGrid } from "./grid";
import { AnyBattleTile } from "../tile/battle/battle-tile";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { TRenderable } from "../../shared/traits/render/renderable";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TEnvironmentElement } from "../environment/environment";

export type BattleGridElement =
	| AnyBattleTower
	| AnyBattleTile
	| BattleCastle
	| ImplementsTrait<typeof TEnvironmentElement>;
export class BattleGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, BattleGridElement> = new Map();
	overEffect: HoverEffect | null = null;
	synergiesEffects: SynergyEffect[] = [];
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
		const gridElements = [
			...alliedArmy.towers,
			alliedArmy.castle,
			...alliedArmy.tiles,
			...enemyArmy.towers,
			...alliedArmy.barracks,
			enemyArmy.castle,
			...enemyArmy.tiles,
			...enemyArmy.barracks,
			...environmentElements,
		];
		for (const gridElement of gridElements) {
			this.setElement(gridElement);
		}
	}

	getRelativeNeighborsInArmy(armyGridPosition: Cell, relativePositions: Cell[], isEnemy: boolean) {
		const founds: BattleGridElement[] = [];
		for (const relativePosition of relativePositions) {
			const yCoordinate = armyGridPosition.y + (isEnemy ? -relativePosition.y : relativePosition.y);
			const targetPosition = new Cell({
				x: armyGridPosition.x + (isEnemy ? -relativePosition.x : relativePosition.x),
				y: yCoordinate,
			});
			const elementFound = this.tiles.get(ArmyGrid.posToString(targetPosition));
			if (elementFound) {
				founds.push(elementFound);
			}
		}
		return founds;
	}

	getRelativeNeighborsInBattle(cell: Cell, relativePositions: Cell[], isEnemy: boolean) {
		const founds: BattleGridElement[] = [];
		for (const relativePosition of relativePositions) {
			const targetPosition = new Cell({
				x: cell.x + (isEnemy ? -relativePosition.x : relativePosition.x),
				y: cell.y + (isEnemy ? -relativePosition.y : relativePosition.y),
			});
			const elementFound = this.tiles.get(ArmyGrid.posToString(targetPosition));
			if (elementFound) {
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
			getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInArmy(cell, relativePositions, false);
			},
			getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInBattle(cell, relativePositions, false);
			},
			getRelativeDirection: () => this.getRelativeDirection(false),
			getBoundaries: () => this.getBoundaries(),
		};
	}

	getEnemyHooks(): GridHooks {
		return {
			getRealPosition: this.cellToGrid.bind(this),
			getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInArmy(cell, relativePositions, true);
			},
			getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInBattle(cell, relativePositions, true);
			},
			getRelativeDirection: () => this.getRelativeDirection(true),
			getBoundaries: () => this.getBoundaries(),
		};
	}

	static flip(battleGrid: BattleGrid, cell: Cell) {
		const halfWidth = (battleGrid.width - 1) / 2;
		const halfHeight = (battleGrid.height - 1) / 2;
		return new Cell({
			x: halfWidth - cell.x + halfWidth,
			y: halfHeight - cell.y + halfHeight,
		});
	}
}

export type GridHooks = {
	getRealPosition: (cell: Cell) => GridPosition;
	getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
	getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
	getRelativeDirection: () => { above: GridPosition; below: GridPosition; left: GridPosition; right: GridPosition };
	getBoundaries: () => { minX: number; minY: number; maxX: number; maxY: number };
};
