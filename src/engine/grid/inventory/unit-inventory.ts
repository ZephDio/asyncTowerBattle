import { Derive } from "@ddd-ts/traits";
import { TGridDrawable, TRenderable } from "../../../shared/traits/drawable";
import { TGrid } from "../tgrid";
import { Cell, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { SynergyEffect } from "../grid-effects/synergy-effect";
import { ArmyGrid } from "../grid";
import { HoverEffect } from "../grid-effects/hover-effect";
import { AnyRecruit } from "../../../shared/traits/recruit";

const inventoryPosition = new ScreenPosition(PercentToReal({ x: 78, y: 55 }));

export class Inventory extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, AnyRecruit> = new Map();
	overEffect: HoverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];
	constructor(
		public position: ScreenPosition = inventoryPosition,
		public width: number = 4,
		public height: number = 5,
		public cellSize: number = 4.9,
	) {
		super({});
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
