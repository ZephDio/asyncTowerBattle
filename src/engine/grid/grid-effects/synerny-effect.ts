import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Grid } from "../grid";
import { BattleGrid } from "../battle-grid";

export class SynergyEffect extends Derive(TDrawable, TRenderable){
    drawPriority: 8;
    size: number;
    constructor(public cell : Cell, grid: Grid | BattleGrid){
        super({})
        this.size = grid.cellSize;
    }

    draw(context: CanvasRenderingContext2D, position: Position): void {

        context.globalAlpha = 0.4;
        context.fillStyle = "blue";
        const { width , height } = this.getCanvasSize(context, this.size, this.size);
        const canvasPosition = this.getCanvasPosition(context, position);
        this.drawRectangle(context, { width : width / 2 , height: height / 2}, canvasPosition);
    }

    get position(){
        return this.cell;
    }
}