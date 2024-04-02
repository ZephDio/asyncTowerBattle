import { Derive } from "@ddd-ts/traits";
import { Cell, Position } from "../../../shared/position";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Grid } from "../grid";
import { BattleGrid } from "../battle-grid";

export class OverEffect extends Derive(TDrawable, TRenderable){
    drawPriority: 8;
    size: number;
    constructor(public cell : Cell, grid: Grid | BattleGrid){
        super({})
        this.size = grid.cellSize;
    }

    draw(context: CanvasRenderingContext2D, position: Position): void {

        context.globalAlpha = 0.3;
        context.fillStyle = "yellow";
        const { width , height } = this.getCanvasSize(context, this.size, this.size);
        const canvasPosition = this.getCanvasPosition(context, position);
        this.drawRectangle(context, {width , height}, canvasPosition);
    }

    get position(){
        return this.cell;
    }
}