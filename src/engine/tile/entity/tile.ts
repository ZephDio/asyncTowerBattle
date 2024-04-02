import { Derive } from "@ddd-ts/traits";
import { TDrawable, TRenderable } from "../../../shared/traits/drawable";
import { Cell, Position } from "../../../shared/position";
import { Resources } from "../../../renderer/resources";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { BasicBattlePathTile, SlowingBattlePathTile } from "../battle/battle-tile";

export type AnyPathTile = BasicPathTile | SlowingPathTile;

export class BasicPathTile extends Derive(TDrawable, TRenderable) {
  constructor(public cell: Cell) {
    super({});
  }

  get position() {
    return this.cell;
  }

  public drawPriority: number = 2;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.path.normal.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const size = this.getCanvasSize(context, 4.9, 4.9);
    const orientation = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2][Math.floor(position.x * position.y) % 3];
    this.drawImage(context, size, canvasPosition, image, orientation);
  }

  toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
    return new BasicBattlePathTile(this, cell, position, hooks);
  }
}

export class SlowingPathTile extends Derive(TDrawable, TRenderable) {
  constructor(public cell: Cell) {
    super({});
  }

  get position() {
    return this.cell;
  }
  public drawPriority: number = 2;

  draw(context: CanvasRenderingContext2D, position: Position): void {
    const image = Resources.path.slowing.image;
    const canvasPosition = this.getCanvasPosition(context, position);
    const size = this.getCanvasSize(context, 4.9, 4.9);
    const orientation = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2][Math.floor(position.x * position.y) % 3];
    this.drawImage(context, size, canvasPosition, image, orientation);
  }

  toBattle(cell: Cell, position: Position, hooks: BattleArmyHooks) {
    return new SlowingBattlePathTile(this, cell, position, hooks);
  }
}
