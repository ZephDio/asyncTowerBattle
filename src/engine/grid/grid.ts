import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable } from "../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "./tgrid";
import { SynergyEffect } from "./grid-effects/synergy-effect";
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

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	overEffect = null as null | HoverEffect;
	synergiesEffects: SynergyEffect[] = [];

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
		return [...this.tiles.values()].filter((e): e is ImplementsTrait<typeof Tower> => implementsTrait(e, Tower));
	}

	get barracks() {
		return [...this.tiles.values()].filter((e): e is ImplementsTrait<typeof Barrack> => implementsTrait(e, Barrack));
	}

	get pathTiles() {
		return [...this.tiles.values()].filter((e): e is ImplementsTrait<typeof PathTile> => implementsTrait(e, PathTile));
	}

	get environment() {
		return [...this.tiles.values()].filter((e): e is ImplementsTrait<typeof TEnvironmentElement> =>
			implementsTrait(e, TEnvironmentElement),
		);
	}

	getEnemyDoorCell() {
		return new Cell({ x: this.width - 1, y: this.height - 1 });
	}
	setOveredTile(cell: Cell | null) {
		if (cell) {
			if (this.overEffect && ArmyGrid.posToString(cell) === ArmyGrid.posToString(this.overEffect?.cell)) {
				return;
			}
			this.overEffect = new HoverEffect(cell, this);
			return;
		}
		this.overEffect = null;
	}

	setSynergiesTiles(
		cell: Cell,
		relativeCellsSynergies: Cell[],
		isActivated: (gridElement: ImplementsTrait<typeof GridElement> | undefined) => boolean,
	) {
		this.clearSynergiesTiles();
		for (const synergyCell of relativeCellsSynergies) {
			this.synergiesEffects.push(
				new SynergyEffect(
					new Cell({
						x: cell.x + synergyCell.x,
						y: cell.y + synergyCell.y,
					}),
					this,
					isActivated,
				),
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
		this.height = 5;
		this.cellSize = 5.5;
		this.translate();
		[new BasicPathTile(new Cell({ x: 6, y: 4 })), new BasicPathTile(new Cell({ x: 7, y: 4 }))].forEach((pathTile) =>
			this.setElement(pathTile),
		);
	}
}
