import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { SynergyEffectHud } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { Castle } from "../castle/recruit/castle-recruit";
import { Tower } from "../tower/recruit/tower-recruit";
import { Barrack } from "../barrack/recruit/barrack-recruit";
import { GridElement } from "../../shared/traits/engine/core/grid-element";
import { PathTile } from "../tile/recruit/tile";
import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../../shared/traits/render/renderable";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { TRecruit } from "../../shared/traits/engine/recruit";
import { TEnvironmentElement } from "../environment/environment";
import { Totem } from "../totem/recruit/totem-recruit";

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	hoverEffect: HoverEffect[] = [];
	synergiesEffects: SynergyEffectHud[] = [];

	constructor(
		width: number = 13,
		height: number = 6,
		public screenPosition: ScreenPosition = PercentToReal({ x: 35, y: 28 }),
		cellSize = STANDARD_CELL_SIZE,
	) {
		super({ width, height, cellSize, position: screenPosition });
	}

	get castle() {
		const castle = [...this.tiles.values()].find((e): e is Castle => e instanceof Castle);
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

	getElements() {
		return [...this.tiles.values()];
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

	roundTwo() {
		this.width = 8;
		this.height = 6;
		this.cellSize = STANDARD_CELL_SIZE;
		this.translate();
		[new BasicPathTile(new Cell({ x: 7, y: 5 }))].forEach((pathTile) => this.setElement(pathTile));
	}
}
