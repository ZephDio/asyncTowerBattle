import { Subtrait } from "@ddd-ts/traits"
import { TRenderable } from "../renderable"
import { Resources } from "../../../../renderer/resources"
import { Size } from "../../../size"

export const BannerBackground = Subtrait([TRenderable], (base) => {
    abstract class IBannerBackground extends base {
        bannerImage = Resources.hudElement.banner.resource.image
        drawBanner(context : CanvasRenderingContext2D, canvasSize : Size, position : { x : number, y : number}){
            this.drawImage(context,canvasSize,position,this.bannerImage)
        }
    }
    return IBannerBackground
})