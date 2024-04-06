import { Derive, ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { Cell, Position } from "../../shared/position";
import { TGridDrawable, TRenderable } from "../../shared/traits/drawable";
import { TGrid } from "./tgrid";
import { SynergyEffect } from "./grid-effects/synergy-effect";
import { OverEffect } from "./grid-effects/over-effect";

export const GridElement = Subtrait([TRenderable], (base) => {
	abstract class IGridElement extends base {
		abstract cell: Cell;

		getRealPosition(grid: ImplementsTrait<typeof TGrid>) {
			return grid.cellToReal(this.cell);
		}
	}
	return IGridElement;
});

export class ArmyGrid extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, ImplementsTrait<typeof GridElement>> = new Map();
	overEffect: OverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];

	constructor(
		public width: number = 13,
		public height: number = 6,
		public position: Position = new Position({ x: 2, y: 1.5 }),
		public cellSize = 4.9,
	) {
		super({});
	}

	getEnemyDoorCell() {
		return new Cell({ x: 0, y: this.height - 1 });
	}
	setOveredTile(cell: Cell | undefined) {
		if (cell) {
			if (this.overEffect && ArmyGrid.posToString(cell) === ArmyGrid.posToString(this.overEffect?.cell)) {
				return;
			}
			this.overEffect = new OverEffect(cell, this);
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

	clearSynergiesTiles() {
		this.synergiesEffects = [];
	}
	static posToString(cell: Cell) {
		return `${cell.x}|${cell.y}`;
	}
}
