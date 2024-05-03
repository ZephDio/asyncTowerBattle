
import { ScreenPosition } from "../../../shared/position";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { Derive } from "@ddd-ts/traits";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { Resources } from "../../../renderer/resources";


export class FactionSelectorCursor extends Derive(
    TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 12, height: 12 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TRenderable,
){

    resource = Resources.hudElement.factionSelector.resource.image;
    drawPriority = DrawPriority.HUD;

    size = { width : 12 , height : 12}
    constructor(public position : ScreenPosition){
        super({})
    }

    setPosition(position: ScreenPosition){
        this.position = position
    }

    draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
        const canvasSize = this.getCanvasSize(context, this.size.width, this.size.height, scale)
        const canvasPosition = this.getCanvasPosition(context, position)
        this.drawImage(context, canvasSize, canvasPosition, this.resource)
    }
}