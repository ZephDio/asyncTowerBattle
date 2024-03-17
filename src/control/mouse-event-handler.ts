import { CanvasRenderer } from "../renderer/implementation/canvas-renderer"
import { InputToIntentTranslator } from "./input-to-intent-translator"

export class MouseEventHandler{
  constructor(private readonly renderer: CanvasRenderer, private readonly inputToIntentTranslator: InputToIntentTranslator){
    window.addEventListener("click", (event) => this.onClick(event))
  }

  onClick(event: MouseEvent) : void{
    const {offsetLeft, offsetTop} = this.renderer.canvas
    const {x, y} = event
    const { width, height } = this.renderer.container.getBoundingClientRect()
    const pixelPosition = {x: x-offsetLeft, y: y-offsetTop}
    const relativePosition = {x: pixelPosition.x/(width/100), y: 100 - pixelPosition.y/(height/100) }
    console.log(relativePosition)
    this.inputToIntentTranslator.translateClickInput(relativePosition)
  }

}