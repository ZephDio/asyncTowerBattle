import { PercentToReal } from "../../renderer/implementation/canvas-renderer";
import { Position } from "../../shared/position";
import { Recruit } from "../../shared/physic";
import { TowerFixtures } from "../tower/entity/tower-fixtures";
import { Buyable } from "./shop";

export type ShopItem = Omit<Buyable<Recruit>, "position">;
export class Retail {
  slots: Position[] = [
    PercentToReal({ x: 33, y: 83 }),
    PercentToReal({ x: 66, y: 83 }),
    PercentToReal({ x: 33, y: 66 }),
    PercentToReal({ x: 66, y: 66 }),
  ];
  buyables: Map<Buyable<Recruit>, Position> = new Map();

  constructor() {
    this.refresh();
  }

  async getRetailItems(): Promise<ShopItem[]> {
    return [
      {
        type: "tower",
        entity: TowerFixtures.BottomLeftTower,
      },
      {
        type: "tower",
        entity: TowerFixtures.BottomMiddleTower,
      },
      {
        type: "tower",
        entity: TowerFixtures.centerTower,
      },
      {
        type: "tower",
        entity: TowerFixtures.topRightTower,
      },
    ];
  }

  async refresh() {
    this.buyables.clear();
    const items = await this.getRetailItems();
    await this.fill(items);
  }

  async fill(items: ShopItem[]) {
    for (const [index, item] of items.entries()) {
      this.buyables.set(
        {
          type: item.type,
          entity: item.entity,
          position: {
            x: this.slots[index].x,
            y: this.slots[index].y,
          },
        },
        this.slots[index]
      );
    }
  }
}
