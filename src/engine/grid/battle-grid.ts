import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { TGridDrawable, TRenderable } from "../../shared/traits/drawable";
import { BattleArmy } from "../army/battle/battle-army";
import { BattleCastle } from "../castle/battle/battle-castle";
import { AnyBattleTower } from "../tower/battle/battle-tower";
import { ArmyGrid } from "./grid";
import { AnyBattleTile } from "../tile/battle/battle-tile";
import { TGrid } from "./tgrid";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";

export type BattleGridElement = AnyBattleTower | AnyBattleTile | BattleCastle;
export class BattleGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, BattleGridElement> = new Map();
	overEffect: HoverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];
	constructor(
		public gridAllied: ArmyGrid,
		public gridEnemy: ArmyGrid,
		public width: number,
		public height: number,
		public position: Position = new Position({ x: 2, y: 1.5 }),
		public cellSize = 4.9,
	) {
		super({});
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
			gridAllied.position,
			gridAllied.cellSize,
		);
		return battleGrid;
	}

	initElements(alliedArmy: BattleArmy, enemyArmy: BattleArmy) {
		const gridElements = [
			...alliedArmy.towers,
			alliedArmy.castle,
			...alliedArmy.path.tiles,
			...enemyArmy.towers,
			...alliedArmy.barracks,
			enemyArmy.castle,
			...enemyArmy.path.tiles,
			...enemyArmy.barracks,
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

	getAlliedHooks(): GridHooks {
		return {
			getRealPosition: this.cellToReal.bind(this),
			getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInArmy(cell, relativePositions, false);
			},
			getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInBattle(cell, relativePositions, false);
			},
		};
	}

	getEnemyHooks(): GridHooks {
		return {
			getRealPosition: this.cellToReal.bind(this),
			getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInArmy(cell, relativePositions, true);
			},
			getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => {
				return this.getRelativeNeighborsInBattle(cell, relativePositions, true);
			},
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
	getRealPosition: (cell: Cell) => Position;
	getRelativeNeighborsInBattle: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
	getRelativeNeighborsInArmy: (cell: Cell, relativePositions: Cell[]) => BattleGridElement[];
};
