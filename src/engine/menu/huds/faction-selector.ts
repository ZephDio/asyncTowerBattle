import { Derive } from "@ddd-ts/traits";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { Faction } from "../main-menu";
import { FactionSelectorCursor } from "./faction-selector-cursor";
import { SelectDwarfButton } from "./select-dwarf-button";
import { SelectElfButton } from "./select-elf-button";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { ScreenPosition } from "../../../shared/position";

export class FactionsSelectorHud extends Derive(TRenderable) {
	position: ScreenPosition = PercentToReal({ x: 50, y: 15 });
	override drawPriority = DrawPriority.HUD;
	positionMap = new Map([
		[Faction.Elf, PercentToReal({ x: 33, y: 15 })],
		[Faction.Dwarf, PercentToReal({ x: 66, y: 15 })],
	]);
	selectElfButton = new SelectElfButton(this.positionMap.get(Faction.Elf)!);
	selectDwarfButton = new SelectDwarfButton(this.positionMap.get(Faction.Dwarf)!);

	cursor = new FactionSelectorCursor(this.positionMap.get(Faction.Elf)!);

	constructor(public selectedClass = Faction.Elf) {
		super({});
	}

	changeClass(selectedClass: Faction) {
		this.selectedClass = selectedClass;
		this.cursor.setPosition(this.positionMap.get(selectedClass)!);
	}

	override draw(context: CanvasRenderingContext2D): void {
		this.selectElfButton.render(context);
		this.selectDwarfButton.render(context);
		this.cursor.render(context);
	}
}
