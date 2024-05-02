import { Derive } from "@ddd-ts/traits"
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer"
import { TRenderable } from "../../../shared/traits/render/renderable"
import { Classes } from "../main-menu"
import { ClassesSelectorCursor } from "./class-selector-cursor"
import { SelectDwarfButton } from "./select-dwarf-button"
import { SelectHumanButton } from "./select-human-button"
import { DrawPriority } from "../../../shared/traits/render/image-drawable"
import { ScreenPosition } from "../../../shared/position"


export class ClassesSelectorHud extends Derive(TRenderable) {
    position : ScreenPosition = PercentToReal({x: 50, y: 15})
    override drawPriority = DrawPriority.HUD
    positionMap = new Map([[Classes.Human,PercentToReal({x: 33, y: 15})], [Classes.Dwarf,PercentToReal({x: 66, y: 15})]])
    selectHumanButton = new SelectHumanButton(this.positionMap.get(Classes.Human)!)
    selectDwarfButton = new SelectDwarfButton(this.positionMap.get(Classes.Dwarf)!)

    cursor = new ClassesSelectorCursor(this.positionMap.get(Classes.Human)!)

    constructor(public selectedClass = Classes.Human){
        super({})
    }

    changeClass(selectedClass: Classes){
        this.selectedClass = selectedClass
        this.cursor.setPosition(this.positionMap.get(selectedClass)!)
    }

    override draw(context: CanvasRenderingContext2D): void {
        this.selectHumanButton.render(context)
        this.selectDwarfButton.render(context)
        this.cursor.render(context)
    }

}