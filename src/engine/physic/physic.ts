import { HitBox } from "../../shared/hitboxes";
import { Position } from "../../shared/position";
export interface Recruit {
  hitbox: HitBox;
}

export abstract class PhysicEntity<T extends Recruit>{
  constructor(public entity: T, public position: Position) { }
  abstract tick(): void;
  abstract isAlive(): boolean
  abstract isAttacked(damage: number): void
  static doCollide(entity: Recruit, position: Position) {
    const hitbox = entity.hitbox;
    for (const [shape, shapeRelativePosition] of hitbox.hitShapes) {
      const absoluteShapePosition = {
        x: position.x - shapeRelativePosition.x,
        y: position.y - shapeRelativePosition.y,
      };
      if (shape.type == "ellipse") {
        const differentialX = position.x - absoluteShapePosition.x;
        const differentialY = position.y - absoluteShapePosition.y;
        const distance = Math.sqrt(
          Math.pow(differentialX, 2) + Math.pow(differentialY, 2)
        );
        const theta = Math.atan2(differentialY, differentialX);
        const relativeWidth = shape.size.width / 2;
        const relativeHeight = shape.size.height / 2;
        const radius =
          (relativeWidth * relativeHeight) /
          Math.sqrt(
            Math.pow(relativeWidth, 2) * Math.pow(Math.sin(theta), 2) +
            Math.pow(relativeHeight, 2) * Math.pow(Math.cos(theta), 2)
          );
        return distance < radius;
      }
      if (shape.type == "rectangle") {
        const isInRangeWidth =
          position.x > absoluteShapePosition.x - shape.size.width / 2 &&
          position.x < absoluteShapePosition.x + shape.size.width / 2;
        if (!isInRangeWidth) return false;
        const isInRangeHeight =
          position.y > absoluteShapePosition.y - shape.size.height / 2 &&
          position.y < absoluteShapePosition.y + shape.size.height / 2;
        if (!isInRangeHeight) return false;
        return true;
      }
    }
  }
}
