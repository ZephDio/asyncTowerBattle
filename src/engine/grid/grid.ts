import { Derive, ImplementsTrait, implementsTrait } from "@ddd-ts/traits";
import { Cell, ScreenPosition } from "../../shared/position";
import { TGridDrawable, TRenderable } from "../../shared/traits/drawable";
import { TGrid } from "./tgrid";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { HoverEffect } from "./grid-effects/hover-effect";
import { AnyRecruit } from "../../shared/traits/recruit";
import { Castle } from "../castle/recruit/castle-recruit";
import { Tower } from "../tower/recruit/tower-recruit";
import { Barrack } from "../barrack/recruit/barrack-recruit";
import { GridElement } from "../../shared/traits/grid-element";
import { PathTile } from "../tile/recruit/tile";

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, AnyRecruit> = new Map();
	overEffect: HoverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];

	constructor(
		public width: number = 13,
		public height: number = 6,
		public position: ScreenPosition = new ScreenPosition({ x: 2, y: 1.5 }),
		public cellSize = 4.9,
	) {
		super({});
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

	getEnemyDoorCell() {
		return new Cell({ x: 0, y: this.height - 1 });
	}
	setOveredTile(cell: Cell | undefined) {
		if (cell) {
			if (this.overEffect && ArmyGrid.posToString(cell) === ArmyGrid.posToString(this.overEffect?.cell)) {
				return;
			}
			this.overEffect = new HoverEffect(cell, this);
			return;
		}
		this.overEffect = undefined;
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

	getRecruit() {
		return [...this.tiles.values()];
	}

	clearSynergiesTiles() {
		this.synergiesEffects = [];
	}
	static posToString(cell: Cell) {
		return `${cell.x}|${cell.y}`;
	}
}
