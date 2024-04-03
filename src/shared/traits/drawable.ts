import { ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";
import { BattleGrid } from "../../engine/grid/battle-grid";
import { Grid } from "../../engine/grid/grid";
import { Cell, Position } from "../position";
import { Size } from "../size";
import { TGrid } from "../../engine/grid/tgrid";

export const TDrawable = Trait((base) => {
  abstract class IDrawable extends base {
    abstract drawPriority: number;

    abstract draw(context: CanvasRenderingContext2D, position: Position): void;

    protected drawEllipse(context: CanvasRenderingContext2D, size: Size, position: { x: number; y: number }) {
      context.beginPath();
      context.ellipse(position.x, position.y, size.width / 2, size.height / 2, 0, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
    }
    protected drawRectangle(context: CanvasRenderingContext2D, size: Size, position: { x: number; y: number }) {
      context.strokeRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
      context.fillRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
      context.stroke();
    }
    protected drawLines(context: CanvasRenderingContext2D, points: Position[]) {
      context.beginPath();
      for (const point of points) {
        context.lineTo(point.x, point.y);
      }
      context.stroke();
    }

    protected drawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
      context.beginPath();
      context.lineTo(x1, y1);
      context.lineTo(x2, y2);
      context.stroke();
    }

    protected getCanvasPosition(context: CanvasRenderingContext2D, position: Position) {
      const x = (context.canvas.width / 100) * position.x;
      const y = context.canvas.height - (context.canvas.width / 100) * position.y; // !
      return { x, y };
    }

    protected getCanvasSize(context: CanvasRenderingContext2D, width: number, height: number) {
      const cWidth = (context.canvas.width / 100) * width;
      const cHeight = (context.canvas.width / 100) * height;
      return { width: cWidth, height: cHeight };
    }

    protected drawImage(
      context: CanvasRenderingContext2D,
      size: Size,
      position: { x: number; y: number },
      image: HTMLImageElement,
      theta: number | undefined = undefined
    ) {
      if (theta) {
        context.save();
        context.translate(position.x, position.y);
        context.rotate(-theta); // canvas rotate clockwise
        context.drawImage(image, -size.width / 2, -size.height / 2, size.width, size.height);
        context.restore();
        return;
      }
      context.drawImage(image, position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
    }
  }
  return IDrawable;
});

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
