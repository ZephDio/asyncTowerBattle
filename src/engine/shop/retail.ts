import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Position } from "../../shared/position";
import { Buyable } from "./shop";
import { OrangeTower } from "../tower/entity/implementation/orange-tower";
import { BlueTower } from "../tower/entity/implementation/blue-tower";
import { GreenTower } from "../tower/entity/implementation/green-tower";
import { YellowTower } from "../tower/entity/implementation/yellow-tower";
import { TRenderable } from "../../shared/traits/drawable";
import { Derive } from "@ddd-ts/traits";
import { Rectangle, TCollider } from "../../shared/hitboxes";

export type ShopItem = Buyable;
export class Retail extends Derive(TRenderable, TCollider([new Rectangle({ w: 50, h: 25 })])) {
  slots: Position[] = [
    new Position(PercentToReal({ x: 33, y: 83 })),
    new Position(PercentToReal({ x: 66, y: 83 })),
    new Position(PercentToReal({ x: 33, y: 66 })),
    new Position(PercentToReal({ x: 66, y: 66 })),
  ];
  buyables: Map<Buyable, Position> = new Map();

  constructor() {
    super({})
    this.refresh();
  }
  drawPriority = 1;
  position = new Position(PercentToReal({ x: 50, y: 75 }));
  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    const size = this.getCanvasSize(context, 50, 25);
    const position = this.getCanvasPosition(context, this.position);
    this.drawRectangle(context, size, position);
  }

  hit(position: Position): boolean {
    return this.contains(position)
  }

  async getRetailItems(): Promise<ShopItem[]> {
    return [
      Buyable.from(new OrangeTower({}), this.slots[0]!, 10),
      Buyable.from(new BlueTower({}), this.slots[1]!, 10),
      Buyable.from(new GreenTower({}), this.slots[2]!, 10),
      Buyable.from(new YellowTower({}), this.slots[3]!, 10),
    ];
  }

  removeItem(buyable: Buyable) {
    this.buyables.delete(buyable);
  }

  addItem(buyable: Buyable) {
    this.buyables.set(buyable, buyable.position);
  }

  async refresh() {
    this.buyables.clear();
    const items = await this.getRetailItems();
    await this.fill(items);
  }

  async fill(items: ShopItem[]) {
    for (const [index, item] of items.entries()) {
      const slot = this.slots[index];
      if (!slot) throw new Error("Slot not found");

      this.buyables.set(item, slot);
    }
  }
}
