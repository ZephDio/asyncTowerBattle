import { Derive } from "@ddd-ts/traits";
import { Position } from "./position";
import { TDrawable } from "./traits/tdrawable";




export class LifeBar extends Derive(TDrawable){
    drawPriority = 3;
    constructor(public maxLife: number, public life: number) {
        super({})
    }

    draw(context: CanvasRenderingContext2D, position: Position): void {
        if(this.life === this.maxLife) return
        context.globalAlpha = 1;
        context.fillStyle = "red";
        const size = this.getCanvasSize(context, 3,0.5)
        const canvasPosition = this.getCanvasPosition(context, position);
        this.drawRectangle(context, size,canvasPosition);
        context.fillStyle = "green";
        const lifeProportion = (this.life / this.maxLife)
        this.drawRectangle(context, { 
            width : size.width * lifeProportion,
            height : size.height
        }, 
        new Position({
            x : canvasPosition.x - lifeProportion - size.width/2 * (1 - lifeProportion),
            y : canvasPosition.y
        }))
    }
}