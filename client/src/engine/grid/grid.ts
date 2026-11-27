import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { GridSize, armyGridSize, fitCellSize } from "./grid-sizes";
import { SynergyEffectHud, TARGET_ICONS } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { LockedCellEffect } from "./grid-effects/locked-cell-effect";
import { CastleEntryPathResources, DoorPathResources } from "../../renderer/resources/path.resources";
import { AnyCastle, Castle } from "../castle/recruit/castle-recruit";
import { Tower } from "../constructs/tower/recruit/tower";
import { Barrack } from "../constructs/barrack/recruit/barrack";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { PathTile } from "../tile/recruit/tile";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../../shared/traits/render/renderable";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { TRecruit } from "../../shared/traits/engine/recruit";
import { TEnvironmentElement } from "../environment/environment";
import { Totem } from "../constructs/totem/recruit/totem";
import { BoardOrientation } from "../../shared/traits/engine/core/board-orientation";
import { TargetZone } from "../target-zone/target-zone";

// The shop's army grid keeps its left edge where the first round's grid has it, so it grows to the right and up only.
export const armyGridCenter = ({ width, height }: GridSize) => {
	const anchor = PercentToReal({ x: 35, y: 28 });
	const first = armyGridSize(1);
	const left = anchor.x - (first.width * fitCellSize(first.height)) / 2;
	return new ScreenPosition({ x: left + (width * fitCellSize(height)) / 2, y: anchor.y });
};

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	hoverEffect: HoverEffect[] = [];
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		width: number = armyGridSize(1).width,
		height: number = armyGridSize(1).height,
		public screenPosition: ScreenPosition = armyGridCenter({ width, height }),
		cellSize = fitCellSize(height),
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	// The castle is not a grid element: it stands off the board beside the top row (see castle-geometry.ts), so it
	// is kept apart from the tiles. Placing it with setElement keeps it here.
	private castleRecruit: AnyCastle | undefined;

	get castle() {
		if (!this.castleRecruit) {
			throw new Error("Castle not found");
		}
		return this.castleRecruit;
	}

	override setElement(gridElement: ImplementsTrait<typeof GridElement>) {
		if (implementsTrait(gridElement, Castle)) {
			gridElement.cell = this.getCastleCell();
			this.castleRecruit = gridElement;
			return;
		}
		super.setElement(gridElement);
	}

	// The castle is drawn with the grid's elements, off the board.
	override getDrawables() {
		return this.castleRecruit ? [...super.getDrawables(), this.castleRecruit] : super.getDrawables();
	}

	get towers() {
		const set = new Set(
			[...this.tiles.values()].filter((e): e is ImplementsTrait<typeof Tower> => implementsTrait(e, Tower)),
		);
		return [...set.values()];
	}

	get barracks() {
		const set = new Set(
			[...this.tiles.values()].filter((e): e is ImplementsTrait<typeof Barrack> => implementsTrait(e, Barrack)),
		);
		return [...set.values()];
	}

	get pathTiles() {
		const set = new Set(
			[...this.tiles.values()].filter((e): e is ImplementsTrait<typeof PathTile> => implementsTrait(e, PathTile)),
		);
		return [...set.values()];
	}

	get totems() {
		const set = new Set(
			[...this.tiles.values()].filter((e): e is ImplementsTrait<typeof Totem> => implementsTrait(e, Totem)),
		);
		return [...set.values()];
	}

	get environment() {
		const set = new Set(
			[...this.tiles.values()].filter((e): e is ImplementsTrait<typeof TEnvironmentElement> =>
				implementsTrait(e, TEnvironmentElement),
			),
		);
		return [...set.values()];
	}

	getEnemyDoorCell() {
		return new Cell({ x: this.width - 1, y: this.height - 1 });
	}

	// The path always ends on the top left cell, the castle's anchor: it leaves the board by that cell's left edge, into
	// the castle standing beside it.
	getCastleEntryCell() {
		return this.getCastleCell();
	}

	// The two ends of the path, the enemy door cell and the castle entry cell, are locked: their tiles can't be picked
	// up or replaced. The lock follows the cells, which move when the grid grows, not the tiles. `outward` is the edge
	// the path leaves the board by: right at the door, left at the castle.
	getLockedCells() {
		return [
			{ cell: this.getEnemyDoorCell(), images: DoorPathResources, outward: new Cell({ x: 1, y: 0 }) },
			{ cell: this.getCastleEntryCell(), images: CastleEntryPathResources, outward: new Cell({ x: -1, y: 0 }) },
		];
	}

	isLockedCell(cell: Cell) {
		return this.getLockedCells().some((locked) => locked.cell.equals(cell));
	}

	isLocked(element: ImplementsTrait<typeof GridElement>) {
		return element.gridShape
			.getOccupiedCellsFrom(element.cell, element.orientation)
			.some((cell) => this.isLockedCell(cell));
	}

	override validateGridElementPlacement(gridElement: ImplementsTrait<typeof GridElement>, cell: Cell) {
		const covers = gridElement.gridShape.getOccupiedCellsFrom(cell);
		if (covers.some((covered) => this.isLockedCell(covered))) return { valid: false, elements: [] };
		return super.validateGridElementPlacement(gridElement, cell);
	}

	// The tiles on the locked cells are drawn as stone roads, from the enemy half and into the castle (through the top left cell's left edge).
	override getCellOverlays() {
		return this.getLockedCells().flatMap(({ cell, images, outward }) => {
			const tile = this.getElement(cell);
			if (!tile || !implementsTrait(tile, PathTile)) return [];
			return [new LockedCellEffect(cell, tile.pathConnections, images, outward)];
		});
	}
	setOveredTile(cells: Cell[] | null) {
		this.hoverEffect = [];
		this.hovered = [];
		if (cells && cells.length > 0) {
			for (const cell of cells) {
				this.hoverEffect.push(new HoverEffect(cell, this));
			}
		}
	}

	setSynergiesTiles(
		cell: Cell,
		relativeCellsSynergies: Cell[],
		isActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean,
	) {
		this.clearSynergiesTiles();
		// An element spanning several pattern cells only lights up the first one, like the synergy only counts it once.
		const counted = new Set<ImplementsTrait<typeof GridElement>>();
		for (const relativeCell of relativeCellsSynergies) {
			const synergyCell = new Cell({
				x: cell.x + relativeCell.x,
				y: cell.y + relativeCell.y,
			});
			const element = this.tiles.get(ArmyGrid.posToString(synergyCell));
			const activated = element !== undefined && !counted.has(element) && isActivated(element);
			if (activated) counted.add(element);
			this.synergiesEffects.push(new SynergyEffectHud(synergyCell, this, activated));
		}
	}

	// Added on top of the synergy stars, so call it after setSynergiesTiles. Target cells off the grid are not drawn.
	addTargetTiles(cell: Cell, targetZone: TargetZone, orientation: BoardOrientation) {
		for (const relativeCell of targetZone.getRelativeCells(orientation)) {
			const targetCell = cell.add(relativeCell);
			if (targetCell.x < 0 || targetCell.x >= this.width || targetCell.y < 0 || targetCell.y >= this.height) continue;
			const activated = targetZone.isTargetable(this.tiles.get(ArmyGrid.posToString(targetCell)));
			this.synergiesEffects.push(new SynergyEffectHud(targetCell, this, activated, TARGET_ICONS));
		}
	}

	// Only the off-board part captures hover: overhanging artwork is not a grid element.
	isOverCastle(position: ScreenPosition) {
		const { x, y } = this.screenToGridPosition(position);
		if (!this.castle) return false;
		const { width, height } = this.castle.layout;
		const halfUnit = STANDARD_CELL_SIZE / 2;
		const center = this.castle?.position;
		return !!center && x >= center.x - width * halfUnit && x < 0 && Math.abs(y - center.y) < height * halfUnit;
	}

	getCastleCell() {
		return new Cell({ x: 0, y: this.height - 1 });
	}
	getRecruits() {
		return [...this.tiles.values()].filter((e): e is ImplementsTrait<typeof TRecruit> => implementsTrait(e, TRecruit));
	}

	clearSynergiesTiles() {
		this.synergiesEffects = [];
	}
	static posToString(cell: Cell) {
		return `${cell.x}|${cell.y}`;
	}

	resetPosition() {
		this.centerPosition = armyGridCenter(this);
		this.updateCornerPosition();
	}

	// New rows come in at the top and new columns on the right. The bottom row of the new columns gets path tiles so
	// the path still reaches the moved enemy door.
	grow({ width, height }: GridSize) {
		const previousWidth = this.width;
		const addedRows = height - this.height;
		this.resize({ width, height });
		const center = armyGridCenter({ width, height });
		this.centerPosition.x = center.x;
		this.centerPosition.y = center.y;
		this.updateCornerPosition();
		for (let i = 0; i < addedRows; i++) this.translate();
		// The castle follows the top row, which moved up with the new rows.
		if (this.castleRecruit) this.castleRecruit.cell = this.getCastleCell();
		for (let x = previousWidth; x < width; x++) {
			this.setElement(new BasicPathTile(new Cell({ x, y: height - 1 })));
		}
	}

	resize({ width, height }: GridSize) {
		this.width = width;
		this.height = height;
		this.cellSize = fitCellSize(height);
		this.updateCornerPosition();
	}

	static sized({ width, height }: GridSize) {
		return new ArmyGrid(width, height);
	}
}
