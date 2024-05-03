import { Derive } from "@ddd-ts/traits"
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer"
import { TRenderable } from "../../../shared/traits/render/renderable"
import { Faction } from "../main-menu"
import { FactionSelectorCursor } from "./faction-selector-cursor"
import { SelectDwarfButton } from "./select-dwarf-button"
import { SelectHumanButton } from "./select-human-button"
import { DrawPriority } from "../../../shared/traits/render/image-drawable"
import { ScreenPosition } from "../../../shared/position"


export class FactionsSelectorHud extends Derive(TRenderable) {
    position : ScreenPosition = PercentToReal({x: 50, y: 15})
    override drawPriority = DrawPriority.HUD
    positionMap = new Map([[Faction.Human,PercentToReal({x: 33, y: 15})], [Faction.Dwarf,PercentToReal({x: 66, y: 15})]])
    selectHumanButton = new SelectHumanButton(this.positionMap.get(Faction.Human)!)
    selectDwarfButton = new SelectDwarfButton(this.positionMap.get(Faction.Dwarf)!)

    cursor = new FactionSelectorCursor(this.positionMap.get(Faction.Human)!)

    constructor(public selectedClass = Faction.Human){
        super({})
    }

    changeClass(selectedClass: Faction){
        this.selectedClass = selectedClass
        this.cursor.setPosition(this.positionMap.get(selectedClass)!)
    }

    override draw(context: CanvasRenderingContext2D): void {
        this.selectHumanButton.render(context)
        this.selectDwarfButton.render(context)
        this.cursor.render(context)
    }

}