import { PercentToReal } from "../../../renderer/implementation/canvas-renderer";
import { BlueTowerRecruit } from "../recruit/implementation/blue-tower-recruit";
import { GreenTowerRecruit } from "../recruit/implementation/green-tower-recruit";
import { OrangeTowerRecruit } from "../recruit/implementation/orange-tower-recruit";
import { BlueTower } from "./implementation/blue-tower";
import { GreenTower } from "./implementation/green-tower";
import { OrangeTower } from "./implementation/orange-tower";

export class TowerFixtures {
  static centerTower = new BlueTowerRecruit(PercentToReal({ x: 75, y: 30 }), new BlueTower());
  static topRightTower = new OrangeTowerRecruit(PercentToReal({ x: 80, y: 80 }), new OrangeTower());
  static BottomLeftTower = new GreenTowerRecruit(PercentToReal({ x: 30, y: 20 }), new GreenTower());
  static BottomMiddleTower = new GreenTowerRecruit(PercentToReal({ x: 50, y: 38 }), new GreenTower());
}
