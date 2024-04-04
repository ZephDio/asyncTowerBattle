import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { BattleGrid } from "../../engine/grid/battle-grid";
import { Grid } from "../../engine/grid/grid";
import { Cell, Position } from "../position";

import { TGrid } from "../../engine/grid/tgrid";
import { HaveStats } from "../../engine/stats/stats";
import { LifeBar } from "../lifebar";
import { TDrawable } from "./tdrawable";



export const TRenderable = Subtrait([TDrawable], (base) => {
  abstract class IRenderable extends base {
    abstract get position(): Position | Cell;

    render(context: CanvasRenderingContext2D, grid: Grid | BattleGrid) {
      if (this.position instanceof Cell) {
        const realPosition = grid.cellToReal(this.position);
        return this.draw(context, realPosition);
      }

      return this.draw(context, this.position);
    }
  }
  return IRenderable;
});

export const THudRenderable = Subtrait([TRenderable], (base) => { 
  abstract class IHudRenderable extends base {
    abstract get huds(): { 
      hud :ImplementsTrait<typeof TDrawable>
      position: Position
    }[];

    render(context: CanvasRenderingContext2D, grid: Grid | BattleGrid): void {
      super.render(context,grid)
      for (const { hud, position } of this.huds) {
        if (this.position instanceof Cell) {
          const realPosition = grid.cellToReal(this.position).add(position);
          hud.draw(context, realPosition);
          return
        }
        hud.draw(context, this.position.add(position))
      }
    }
  }
  return IHudRenderable;
});

export const TLifeBarRenderable = Subtrait([THudRenderable, HaveStats], (base) => {
  abstract class ILifeBarRenderable extends base {

    get lifeBarHud(){
      return { hud : new LifeBar(this.stats.maxHealth, this.stats.health), position : new Position({ x: 0, y: 2.5 }) }
    }

    render(context: CanvasRenderingContext2D, grid: Grid | BattleGrid): void {
      super.render(context,grid)
      const huds = [...this.huds, this.lifeBarHud]
      for (const { hud, position } of huds) {
        if (this.position instanceof Cell) {
          const realPosition = grid.cellToReal(this.position).add(position);
          hud.draw(context, realPosition);
          return
        }
        hud.draw(context, this.position.add(position))
      }
    }
  }
  return ILifeBarRenderable;
});



export const TImageDrawable = (image: HTMLImageElement, size: { width: number; height: number }, priority: number) =>
  Subtrait([TDrawable], (base) => {
    abstract class TImageDrawable extends base {
      drawable = {
        image: image,
        size: size,
        priority: priority,
      };

      get drawPriority() {
        return this.drawable.priority;
      }

      draw(context: CanvasRenderingContext2D, position: Position): void {
        const { width, height } = this.drawable.size;
        const size = this.getCanvasSize(context, width, height);
        const canvasPosition = this.getCanvasPosition(context, position);
        this.drawImage(context, size, canvasPosition, this.drawable.image);
      }
    }
    return TImageDrawable;
  });

export const HTImageDrawable = Subtrait([TImageDrawable(new Image(), { width: 0, height: 0 }, 0)], (base, Props) => {
  return class HTImageDrawable extends base {
    constructor(props: { imageDrawable: ImplementsTrait<ReturnType<typeof TImageDrawable>> } & typeof Props) {
      super(props);
      this.draw = props.imageDrawable.draw;
      this.drawable = props.imageDrawable.drawable;
    }
  };
});

export const TGridDrawable = Subtrait([TGrid, TDrawable], (base) => {
  abstract class IGridDrawable extends base {
    drawPriority = 1;
    draw(context: CanvasRenderingContext2D): void {
      context.fillStyle = "#6C6";
      const position = this.getCanvasPosition(context, this.position);
      const tileSize = this.getCanvasSize(context, this.cellSize, this.cellSize).width;
      context.rect(position.x, position.y, this.width * tileSize, -this.height * tileSize);
      context.fill();

      context.lineWidth = 3;
      context.strokeStyle = "rgba(0,0,0,0.1)";
      for (const ci of new Array(this.width + 1).keys()) {
        this.drawLine(context, position.x + ci * tileSize, position.y, position.x + ci * tileSize, position.y - this.height * tileSize);
      }
      for (const ri of new Array(this.height + 1).keys()) {
        this.drawLine(context, position.x, position.y - ri * tileSize, position.x + this.width * tileSize, position.y - ri * tileSize);
      }
    }
  }
  return IGridDrawable;
});
