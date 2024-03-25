import { HitBox } from "./hitboxes";
import { Position } from "./position";
export interface Recruit {
  type: string;
  hitbox: HitBox;
}

export class Physic {
  static getDistance(positionA: Position, positionB: Position) {
    const differentialX = positionA.x - positionB.x;
    const differentialY = positionA.y - positionB.y;
    return Math.sqrt(Math.pow(differentialX, 2) + Math.pow(differentialY, 2));
  }

  static getDistanceSqrd(positionA: Position, positionB: Position) {
    const differentialX = positionA.x - positionB.x;
    const differentialY = positionA.y - positionB.y;
    return Math.pow(differentialX, 2) + Math.pow(differentialY, 2);
  }

  static getTheta(positionA: Position, positionB: Position) {
    const differentialX = positionB.x - positionA.x;
    const differentialY = positionB.y - positionA.y;
    return Math.atan2(differentialY, differentialX);
  }

  static getVector(positionA: Position, positionB: Position) {
    const differentialX = positionA.x - positionB.x;
    const differentialY = positionA.y - positionB.y;
    return { distance: Math.sqrt(Math.pow(differentialX, 2) + Math.pow(differentialY, 2)), theta: Math.atan2(differentialY, differentialX) };
  }

  static getEllipseRadius(radiusWidth: number, radiusHeight: number, theta: number) {
    return (radiusWidth * radiusHeight) / Math.sqrt(Math.pow(radiusWidth, 2) * Math.pow(Math.sin(theta), 2) + Math.pow(radiusHeight, 2) * Math.pow(Math.cos(theta), 2));
  }

  static getNextPosition(position: Position, destination: Position, speed: number) {
    const theta = Physic.getTheta(position, destination);
    const nextPosition = {
      x: position.x + Math.cos(theta) * speed,
      y: position.y + Math.sin(theta) * speed,
    };
    const differential = Physic.getDistance(destination, position);

    if (differential < speed) {
      return destination;
    }
    return nextPosition;
  }

  static doCollide(entityPosition: Position, hitbox: HitBox, position: Position) {
    for (const [shape, shapeRelativePosition] of hitbox.hitShapes) {
      const absoluteShapePosition = {
        x: entityPosition.x - shapeRelativePosition.x,
        y: entityPosition.y - shapeRelativePosition.y,
      };
      if (shape.type == "ellipse") {
        const { distance, theta } = Physic.getVector(position, absoluteShapePosition);
        const radiusWidth = shape.size.width / 2;
        const radiusHeight = shape.size.height / 2;
        const radius = Physic.getEllipseRadius(radiusWidth, radiusHeight, theta);
        return distance < radius;
      }
      if (shape.type == "rectangle") {
        const isInRangeWidth = position.x > absoluteShapePosition.x - shape.size.width / 2 && position.x < absoluteShapePosition.x + shape.size.width / 2;
        if (!isInRangeWidth) return false;
        const isInRangeHeight = position.y > absoluteShapePosition.y - shape.size.height / 2 && position.y < absoluteShapePosition.y + shape.size.height / 2;
        if (!isInRangeHeight) return false;
        return true;
      }
    }
  }
}

export abstract class PhysicEntity<T extends Recruit> {
  constructor(public entity: T, public position: Position) {}
  abstract tick(): void;
  abstract isAlive(): boolean;
  abstract isAttacked(damage: number): void;
}
