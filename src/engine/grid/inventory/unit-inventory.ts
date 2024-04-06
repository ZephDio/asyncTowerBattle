import { Derive } from "@ddd-ts/traits";
import { HTImageDrawable, TGridDrawable, TRenderable } from "../../../shared/traits/drawable";
import { TGrid } from "../tgrid";
import { Cell, Position } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { SynergyEffect } from "../grid-effects/synergy-effect";
import { ArmyGrid, GridElement } from "../grid";
import { AnyUnit } from "../../units/recruit/unit-recruit";
import { HTHitbox, TGCollider } from "../../../shared/hitboxes";
import { OverEffect } from "../grid-effects/over-effect";

const inventoryPosition = PercentToReal({ x: 78, y: 55 });

export class PtiWrapRanch extends Derive(TGCollider, GridElement, TRenderable, HTImageDrawable, HTHitbox) {
	constructor(
		public unit: AnyUnit,
		public cell: Cell,
	) {
		super({ imageDrawable: unit, hitboxHolder: unit });
	}

	get position() {
		return this.cell;
	}
}

export class UnitInventory extends Derive(TRenderable, TGrid, TGridDrawable) {
	tiles: Map<string, PtiWrapRanch> = new Map();
	overEffect: OverEffect | undefined = undefined;
	synergiesEffects: SynergyEffect[] = [];
	constructor(
		public position: Position = inventoryPosition,
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
	addUnit(unit: AnyUnit) {
		const freeCell = this.getNextFreeCell();
		if (!freeCell) throw new Error("No free cell in inventory");
		const unitInventory = new PtiWrapRanch(unit, freeCell);
		this.setElement(unitInventory);
	}

	setOveredTile(cell: Cell | undefined) {
		if (cell) {
			this.overEffect = new OverEffect(cell, this);
			return;
		}
		this.overEffect = undefined;
	}

	getUnits() {
		return [...this.tiles.values()];
	}
}
