import { HitBox } from "./hitboxes";
import { Position } from "./position";
import { Size } from "./size";
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


  static getVectorSqrd(positionA: Position, positionB: Position) {
    const differentialX = positionA.x - positionB.x;
    const differentialY = positionA.y - positionB.y;
    return { distance: Math.pow(differentialX, 2) + Math.pow(differentialY, 2), theta: Math.atan2(differentialY, differentialX) };
  }

  static getEllipseRadius(radiusWidth: number, radiusHeight: number, theta: number) {
    return (radiusWidth * radiusHeight) / Math.sqrt(Math.pow(radiusWidth, 2) * Math.pow(Math.sin(theta), 2) + Math.pow(radiusHeight, 2) * Math.pow(Math.cos(theta), 2));
  }

  static getEllipseRadiusSqrd(radiusWidth: number, radiusHeight: number, theta: number) {
    const sinThetaSquared = Math.sin(theta) ** 2;
    const cosThetaSquared = Math.cos(theta) ** 2;
    return (radiusWidth * radiusWidth * radiusHeight * radiusHeight) / (radiusWidth * radiusWidth * sinThetaSquared + radiusHeight * radiusHeight * cosThetaSquared);
  }

  static getNextPositionAndOrientation(position: Position, destination: Position, speed: number) {
    const theta = Physic.getTheta(position, destination);
    const nextPosition = {
      x: position.x + Math.cos(theta) * speed,
      y: position.y + Math.sin(theta) * speed,
    };
    const differential = Physic.getDistanceSqrd(destination, position);

    if (differential < speed * speed) {
      return [destination, theta] as const;
    }
    return [nextPosition, theta] as const;
  }

  static doCollide(entityPosition: Position, hitbox: HitBox, position: Position) {
    for (const [shape, shapeRelativePosition] of hitbox.hitShapes) {
      const absoluteShapePosition = {
        x: entityPosition.x - shapeRelativePosition.x,
        y: entityPosition.y - shapeRelativePosition.y,
      };
      if (shape.type == "ellipse") {
        if (!Physic.isPointInsideEllipse(position, absoluteShapePosition, shape.size)) {
          return false
        }
        const { distance, theta } = Physic.getVectorSqrd(position, absoluteShapePosition);
        const radiusWidth = shape.size.width / 2;
        const radiusHeight = shape.size.height / 2;
        const radius = Physic.getEllipseRadiusSqrd(radiusWidth, radiusHeight, theta);
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

  static isPointInsideEllipse(point: Position, ellipsePosition: Position, ellipseSize: Size): boolean {
    const localPoint = {
      x: point.x - ellipsePosition.x,
      y: point.y - ellipsePosition.y,
    };
    const dx = localPoint.x / (ellipseSize.width / 2);
    const dy = localPoint.y / (ellipseSize.height / 2);
    return dx * dx + dy * dy <= 1;
  }
}

export abstract class PhysicEntity<T extends Recruit> {
  constructor(public entity: T, public position: Position, public theta: number, public type: string) { }
  abstract tick(): void;
  abstract isAlive(): boolean;
  abstract isAttacked(damage: number): void;
}
