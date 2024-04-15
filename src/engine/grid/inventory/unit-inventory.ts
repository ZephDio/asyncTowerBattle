import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "../tgrid";
import { Cell, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { SynergyEffect } from "../grid-effects/synergy-effect";
import { ArmyGrid } from "../grid";
import { HoverEffect } from "../grid-effects/hover-effect";
import { AnyRecruit } from "../../../shared/traits/engine/recruit";
import { TRenderable } from "../../../shared/traits/render/renderable";


export class Inventory extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, AnyRecruit> = new Map();
	overEffect: HoverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];
	constructor(
		screenPosition : ScreenPosition = PercentToReal({ x: 85, y: 75 }),
		width: number = 4,
		height: number = 5,
		cellSize: number = STANDARD_CELL_SIZE,
	) {
		super({ cellSize, height, width , position: screenPosition});
	}

	getNextFreeCell() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = new Cell({ x, y });
				if (!this.tiles.has(ArmyGrid.posToString(cell))) {
					return cell;
				}
			}
		}
		return undefined;
	}
	add(recruit: AnyRecruit) {
		const freeCell = this.getNextFreeCell();
		if (!freeCell) throw new Error("No free cell in inventory");
		recruit.cell = freeCell.clone();
		this.setElement(recruit);
	}

	setOveredTile(cell: Cell | undefined) {
		if (cell) {
			this.overEffect = new HoverEffect(cell, this);
			return;
		}
		this.overEffect = undefined;
	}

	getRecruits() {
		return [...this.tiles.values()];
	}
}
