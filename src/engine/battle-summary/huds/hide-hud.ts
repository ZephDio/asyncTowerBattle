import { Derive } from "@ddd-ts/traits";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { Resources } from "../../../renderer/resources";
import { GridPosition, ScreenPosition } from "../../../shared/position";
import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";

export class HideHud extends Derive(
  TCollider,
	THitbox(new HitBox([[new Rectangle({ width:18, height: 11 }), new GridPosition({ x: 0, y: 0 })]])),
  TDrawable,
  TRenderable) {
  constructor(public hiddenState : { hidden : boolean },public position : ScreenPosition =  PercentToReal({ x: 50, y: 85 })) {
      super({});
  }
  size = { width: 18, height: 11 };
  drawPriority = DrawPriority.HUD;
	background = Resources.hudElement.startGame.resource.image;

  draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale : number): void {
		const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale);
		const canvasPosition = this.getCanvasPosition(context, position);
		this.drawImage(context, canvasSize, canvasPosition, this.background);

		context.fillStyle = "white";
		context.font = `${canvasSize.height * 0.22}px title`;
		context.textAlign = "center";
		context.fillText("Hide", canvasPosition.x, canvasPosition.y);
  }

}