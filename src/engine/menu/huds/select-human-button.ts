import { ScreenPosition } from "../../../shared/position";
import { THitbox } from "../../../shared/traits/engine/core/THitbox";
import { TCollider } from "../../../shared/traits/engine/core/TCollider";
import { HitBox } from "../../../shared/hitbox/hitboxe";
import { Rectangle } from "../../../shared/hitbox/shapes/rectangle";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { Derive } from "@ddd-ts/traits";
import { HumanCastleBlueprint } from "../../castle/blueprint/human-castle-blueprint";
import { SoldierBlueprint } from "../../units/blueprint/implementation/soldier-blueprint";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";


export class SelectHumanButton extends Derive(
    TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 12, height: 12 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TRenderable,
){
    override drawPriority: DrawPriority.HUD;
    castle = new HumanCastleBlueprint({})
    defaultUnit = new SoldierBlueprint({})
    constructor(public position : ScreenPosition){
        super({})
    }

    draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number){
      
      const castlePosition = position.add(new ScreenPosition({x: 0, y: -1}))
      this.castle.draw(context, castlePosition, scale)
      const unitPosition = position.add(new ScreenPosition({x: 0, y: 3}))
      this.defaultUnit.draw(context, unitPosition, scale)
    }
}