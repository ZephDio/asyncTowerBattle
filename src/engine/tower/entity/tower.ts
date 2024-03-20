import { HitBox } from "../../../shared/hitboxes";
import { BlueTower } from "./implementation/blue-tower";
import { GreenTower } from "./implementation/green-tower";
import { OrangeTower } from "./implementation/orange-tower";

export abstract class Tower {
  abstract type: "orange" | "blue" | "green";
  abstract hitbox: HitBox;
}
