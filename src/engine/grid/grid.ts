import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { GridSize, armyGridSize, fitCellSize } from "./grid-sizes";
import { SynergyEffectHud, TARGET_ICONS } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
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

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	hoverEffect: HoverEffect[] = [];
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		width: number = armyGridSize(1).width,
		height: number = armyGridSize(1).height,
		public screenPosition: ScreenPosition = PercentToReal({ x: 35, y: 28 }),
		cellSize = fitCellSize(height),
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	get castle() {
		const castle = [...this.tiles.values()].find((e): e is AnyCastle => implementsTrait(e, Castle));
		if (!castle) {
			throw new Error("Castle not found");
		}
		return castle;
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
	setOveredTile(cells: Cell[] | null) {
		this.hoverEffect = [];
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
		this.centerPosition = PercentToReal({ x: 35, y: 28 });
		this.updateCornerPosition();
	}

	// New rows come in at the top and new columns on the right. The bottom row of the new columns gets path tiles so
	// the path still reaches the moved enemy door.
	grow({ width, height }: GridSize) {
		const previousWidth = this.width;
		const addedRows = height - this.height;
		this.resize({ width, height });
		for (let i = 0; i < addedRows; i++) this.translate();
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
