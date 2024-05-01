import { Derive } from "@ddd-ts/traits";
import { TGridDrawable } from "../../../shared/traits/render/grid-renderable";
import { STANDARD_CELL_SIZE, TGrid } from "../tgrid";
import { Cell, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { SynergyEffectHud } from "../grid-effects/synergy-effect";
import { HoverEffect } from "../grid-effects/hover-effect";
import { AnyRecruit } from "../../../shared/traits/engine/recruit";
import { TRenderable } from "../../../shared/traits/render/renderable";

export class Inventory extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, AnyRecruit> = new Map();
	hoverEffect: HoverEffect[] = [];
	synergiesEffects: SynergyEffectHud[] = [];
	constructor(
		screenPosition: ScreenPosition = PercentToReal({ x: 85, y: 25 }),
		width: number = 4,
		height: number = 5,
		cellSize: number = STANDARD_CELL_SIZE,
	) {
		super({ cellSize, height, width, position: screenPosition });
	}

	getNextValidPosition(recruit: AnyRecruit) {
		const cells = recruit.gridShape.getVectorialCells(recruit.orientation);
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const cell = new Cell({ x, y });
				let valid = true;
				for (const cellOffset of cells) {
					const cellInShape = cell.add(cellOffset);
					if(cellInShape.x >= this.width || cellInShape.y >= this.height) {
						valid = false;
						break;
					}
					if(cellInShape.x < 0 || cellInShape.y < 0) {
						valid = false;
						break;
					}
					if (this.getElement(cellInShape)) {
						valid = false;
						break;
					}
				}
				if(valid) {
					return cell;
				}
			}
		}
		return undefined;
	}
	add(recruit: AnyRecruit) {
		const freeCell = this.getNextValidPosition(recruit);
		if (!freeCell) throw new Error("No free cell in inventory");
		recruit.cell = freeCell.clone();
		this.setElement(recruit);
	}

	setOveredTile(cells: Cell[] | null) {
		this.hoverEffect = [];
		if (cells && cells.length > 0) {
			for (const cell of cells) {
				this.hoverEffect.push(new HoverEffect(cell, this));
			}
		}
	}

	getRecruits() {
		return [...this.tiles.values()];
	}
}
