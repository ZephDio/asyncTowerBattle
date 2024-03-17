import { CanvasRenderer } from "../renderer/implementation/canvas-renderer";
import { HitShape } from "../shared/hitbox";
import { Position } from "../shared/position";
import { InputToIntentTranslator } from "./input-to-intent-translator";

export class MouseEventHandler {
  constructor(
    private readonly renderer: CanvasRenderer,
    private readonly inputToIntentTranslator: InputToIntentTranslator
  ) {
    window.addEventListener("click", (event) => this.onClick(event));
  }

  onClick(event: MouseEvent): void {
    const mousePosition = { x: event.x, y: event.y };
    const relativePosition = this.pixelPositionToRelative(mousePosition);
    this.inputToIntentTranslator.translateClickInput(relativePosition);
  }

  pixelPositionToRelative(position: Position) {
    const { offsetLeft, offsetTop } = this.renderer.canvas;
    const { width, height } = this.renderer.container.getBoundingClientRect();
    const pixelPosition = {
      x: position.x - offsetLeft,
      y: position.y - offsetTop,
    };
    const relativePosition = {
      x: pixelPosition.x / (width / 100),
      y: 100 - pixelPosition.y / (height / 100),
    };
    const shape = new HitShape("ellipse", {width: 5, height: 5})
    console.log(HitShape.pointCollision(shape,relativePosition))
    return relativePosition;
  }
}
