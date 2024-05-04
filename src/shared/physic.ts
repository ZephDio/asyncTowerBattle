import { HitBox } from "./hitbox/hitboxe";
import { Ellipse } from "./hitbox/shapes/ellipse";
import { Rectangle } from "./hitbox/shapes/rectangle";
import { Cell, GridPosition, ScreenPosition } from "./position";
export interface Recruit {
	type: string;
	hitbox: HitBox;
}

type Position = GridPosition | ScreenPosition;

export class Physic {
	static getDistance<T extends GridPosition | ScreenPosition>(positionA: T, positionB: T) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return Math.sqrt(differentialX ** 2 + differentialY ** 2);
	}

	static getDistanceSqrd<T extends GridPosition | ScreenPosition>(positionA: T, positionB: T) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return differentialX ** 2 + differentialY ** 2;
	}

	static getTheta<T extends GridPosition | ScreenPosition>(positionA: T, positionB: T) {
		const differentialX = positionB.x - positionA.x;
		const differentialY = positionB.y - positionA.y;
		return Math.atan2(differentialY, differentialX);
	}

	static getVector<T extends GridPosition | ScreenPosition>(positionA: T, positionB: T) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		const distanceSquared = differentialX ** 2 + differentialY ** 2;
		const distance = Math.sqrt(distanceSquared);
		const theta = Math.atan2(differentialY, differentialX);
		return { distance, theta };
	}

	static getProjectionCellsFromOrientation(cell: Cell, orientation: number) {
		return new Cell({
			x: Math.round(cell.x * Math.cos(orientation) - cell.y * Math.sin(orientation)),
			y: Math.round(cell.x * Math.sin(orientation) + cell.y * Math.cos(orientation)),
		});
	}

	static getVectorSqrd<T extends GridPosition | ScreenPosition>(positionA: T, positionB: T) {
		if (!(typeof positionA === typeof positionB)) {
			throw new Error("Both positions must be of the same type");
		}
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return {
			distance: differentialX ** 2 + differentialY ** 2,
			theta: Math.atan2(differentialY, differentialX),
		};
	}

	static getNextPosition(position: GridPosition, theta: number, speed: number) {
		return new GridPosition({
			x: position.x + Math.cos(theta) * speed,
			y: position.y + Math.sin(theta) * speed,
		});
	}
	
	static getPositionFromPositionAndVectorAndOrientation(gridPosition: GridPosition, orientation: number, vector: GridPosition) {
		const defaultTileGridPosition = new GridPosition({
			x: gridPosition.x - (vector.x * Math.cos(orientation)) + (vector.y * Math.sin(orientation)),
			y: gridPosition.y - (vector.x * Math.sin(orientation)) - (vector.y * Math.cos(orientation))
		});
		return defaultTileGridPosition;
	}

	static getEllipseRadius(radiusWidth: number, radiusHeight: number, theta: number) {
		return (
			(radiusWidth * radiusHeight) /
			Math.sqrt(radiusWidth ** 2 * Math.sin(theta) ** 2 + radiusHeight ** 2 * Math.cos(theta) ** 2)
		);
	}

	static getEllipseRadiusSqrd(radiusWidth: number, radiusHeight: number, theta: number) {
		const sinThetaSquared = Math.sin(theta) ** 2;
		const cosThetaSquared = Math.cos(theta) ** 2;
		return (
			(radiusWidth * radiusWidth * radiusHeight * radiusHeight) /
			(radiusWidth * radiusWidth * sinThetaSquared + radiusHeight * radiusHeight * cosThetaSquared)
		);
	}

	static getNextPositionAndOrientation(position: GridPosition, destination: GridPosition, speed: number) {
		const theta = Physic.getTheta(position, destination);
		const nextPosition = new GridPosition({
			x: position.x + Math.cos(theta) * speed,
			y: position.y + Math.sin(theta) * speed,
		});
		const differential = Physic.getDistanceSqrd<GridPosition>(destination, position);

		if (differential < speed * speed) {
			return [destination, theta] as const;
		}
		return [nextPosition, theta] as const;
	}

	static doCollide<T extends GridPosition | ScreenPosition>(entityPosition: T, hitbox: HitBox, point: T) {
		for (const [shape, shapeRelativePosition] of hitbox.hitShapes) {
			const shapePosition = entityPosition.add(shapeRelativePosition as GridPosition) as T; // TODO
			if (shape instanceof Rectangle) {
				const x1 = shapePosition.x - shape.w / 2;
				const y1 = shapePosition.y - shape.h / 2;
				if (point.x > x1 && point.x < x1 + shape.w && point.y > y1 && point.y < y1 + shape.h) {
					return true;
				}
			}
			if (shape instanceof Ellipse) {
				return ((point.x - shapePosition.x) / shape.rx) ** 2 + ((point.y - shapePosition.y) / shape.ry) ** 2 <= 1;
			}
		}
		return false;
	}

	static doHitboxesCollide<T extends GridPosition | ScreenPosition>(
		elementPosition: T,
		hitbox: HitBox,
		otherElementPosition: T,
		otherHitBox: HitBox,
	) {
		for (const [shape, position] of hitbox.hitShapes) {
			const shapePosition = elementPosition.add(position as GridPosition) as T;
			for (const [otherShape, otherShapeRelativePosition] of otherHitBox.hitShapes) {
				const otherShapePosition = otherElementPosition.add(otherShapeRelativePosition as GridPosition) as T;
				if (shape instanceof Rectangle && otherShape instanceof Rectangle) {
					// check for square collision
					const x1 = shapePosition.x - shape.w / 2;
					const y1 = shapePosition.y - shape.h / 2;
					const x2 = otherShapePosition.x - otherShape.w / 2;
					const y2 = otherShapePosition.y - otherShape.h / 2;

					if (x1 < x2 + otherShape.w && x1 + shape.w > x2 && y1 < y2 + otherShape.h && y1 + shape.h > y2) {
						return true;
					}
					continue;
				}
				if (shape instanceof Ellipse && otherShape instanceof Ellipse) {
					// check for circle collision
					const dx = otherShapePosition.x - shapePosition.x;
					const dy = otherShapePosition.y - shapePosition.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					// Check if the distance is less than the sum of the radii
					if (distance < shape.rx + otherShape.rx && distance < shape.rx + otherShape.ry) {
						return true;
					}
					continue;
				}
				if (shape instanceof Rectangle && otherShape instanceof Ellipse) {
					// Calculate the top-left corner of the rectangle
					let rectTopLeftX = shapePosition.x - shape.w / 2;
					let rectTopLeftY = shapePosition.y - shape.h / 2;

					// Find the closest point on the rectangle to the ellipse
					let closestX = Physic.clamp(otherShapePosition.x, rectTopLeftX, rectTopLeftX + shape.w);
					let closestY = Physic.clamp(otherShapePosition.y, rectTopLeftY, rectTopLeftY + shape.h);

					// Calculate the distance between the closest point and the ellipse's center
					let distanceX = otherShapePosition.x - closestX;
					let distanceY = otherShapePosition.y - closestY;
					let distance = Math.sqrt(
						(distanceX * distanceX) / (otherShape.rx * otherShape.rx) +
							(distanceY * distanceY) / (otherShape.ry * otherShape.ry),
					);

					// Threshold for collision check
					const COLLISION_THRESHOLD = 1;

					// Check if the distance is less than or equal to COLLISION_THRESHOLD
					if (distance <= COLLISION_THRESHOLD) {
						return true;
					}
					continue;
				}
				if (shape instanceof Ellipse && otherShape instanceof Rectangle) {
					// check for circle square collision
					// Calculate the coordinates of the top-left corner of the rectangle
					let rectTopLeftX = otherShapePosition.x - otherShape.w / 2;
					let rectTopLeftY = otherShapePosition.y - otherShape.h / 2;

					// Find the closest point on the rectangle to the ellipse
					let closestX = Physic.clamp(shapePosition.x, rectTopLeftX, rectTopLeftX + otherShape.w);
					let closestY = Physic.clamp(shapePosition.y, rectTopLeftY, rectTopLeftY + otherShape.h);

					// Calculate the distance between the closest point and the ellipse's center
					let distanceX = shapePosition.x - closestX;
					let distanceY = shapePosition.y - closestY;
					let distance = Math.sqrt(
						(distanceX * distanceX) / (shape.rx * shape.rx) + (distanceY * distanceY) / (shape.ry * shape.ry),
					);

					// Check if the distance is less than or equal to 1
					const COLLISION_THRESHOLD = 1;

					// Check if the distance is less than or equal to COLLISION_THRESHOLD
					if (distance <= COLLISION_THRESHOLD) {
						return true;
					}
					continue;
				}
			}
		}
		return false;
	}

	static clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}
}

export abstract class PhysicEntity<T extends Recruit> {
	constructor(
		public entity: T,
		public position: Position,
		public theta: number,
		public type: string,
	) {}
	abstract tick(): void;
	abstract isAlive(): boolean;
	isAttacked(damage: number): void {
		// Do nothing
		damage;
	}
}
