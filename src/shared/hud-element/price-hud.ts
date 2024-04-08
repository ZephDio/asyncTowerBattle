import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TDrawable } from "../traits/tdrawable";
import { Position } from "../position";
import { Resources } from "../../renderer/resources";
import { THasPrice } from "../traits/has-price";

export class PriceHud extends Derive(TDrawable){
    override drawPriority: 4;
    constructor(private buyable : ImplementsTrait<typeof THasPrice>){
        super({})
    }
    draw(context : CanvasRenderingContext2D, position : Position){
        context.globalAlpha = 1;
		context.fillStyle = "yellow";
		const image = Resources.hudElement.gold.resource.image;
		const canvasPosition = this.getCanvasPosition(context, position);
		const size = this.getCanvasSize(context, 1.9, 1.9);
		const text = this.buyable.price.toString();
        const textPosition = this.getCanvasPosition(context, new Position({ x: position.x, y: position.y - 0.6 }));
		context.font = `${size.height}px Arial`;
		const textWidth = context.measureText(text).width;
        const offSet = ((textWidth)+31)/2
		context.fillText(text, textPosition.x - offSet, textPosition.y);
        canvasPosition.x = canvasPosition.x + (textWidth/2)
		this.drawImage(context, size, canvasPosition, image);
    }
}