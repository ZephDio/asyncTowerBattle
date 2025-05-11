import { Subtrait } from "@ddd-ts/traits"
import { TRenderable } from "../renderable"
import { Size } from "../../../size"
import { HudElementResources } from "../../../../renderer/resources/hud-element.resources"

export const BannerBackground = Subtrait([TRenderable], (base) => {
    abstract class IBannerBackground extends base {
        bannerImage = HudElementResources.banner.image
        drawBanner(context : CanvasRenderingContext2D, canvasSize : Size, position : { x : number, y : number}){
            this.drawImage(context,canvasSize,position,this.bannerImage)
        }
    }
    return IBannerBackground
})