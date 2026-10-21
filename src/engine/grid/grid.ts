import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { TGrid } from "./tgrid";
import { ARMY_GRID_SIZES, GridSize, fitCellSize } from "./grid-sizes";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
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
import { EnvironmentGeneration } from "../environment/env-generation";

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	hoverEffect: HoverEffect[] = [];
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		width: number = ARMY_GRID_SIZES.round1.width,
		height: number = ARMY_GRID_SIZES.round1.height,
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
		for (const relativeCell of relativeCellsSynergies) {
			const synergyCell = new Cell({
				x: cell.x + relativeCell.x,
				y: cell.y + relativeCell.y,
			});
			this.synergiesEffects.push(
				new SynergyEffectHud(synergyCell, this, isActivated(this.tiles.get(ArmyGrid.posToString(synergyCell)))),
			);
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

	roundOne(envGenerator: EnvironmentGeneration) {
		envGenerator.generateEnvironmentForRoundOne(this);
	}
	roundTwo(envGenerator: EnvironmentGeneration) {
		this.resize(ARMY_GRID_SIZES.round2);
		this.translate();
		this.setElement(new BasicPathTile(this.getEnemyDoorCell()));
		envGenerator.generateEnvironmentForRoundTwo(this);
	}

	roundThree(envGenerator: EnvironmentGeneration) {
		const previousWidth = this.width;
		this.resize(ARMY_GRID_SIZES.round3);
		for (let x = previousWidth; x < this.width; x++) {
			this.setElement(new BasicPathTile(new Cell({ x, y: this.height - 1 })));
		}
		envGenerator.generateEnvironmentForRoundTwo(this);
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
