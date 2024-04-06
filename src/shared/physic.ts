import { Ellipse, HitBox, Rectangle } from "./hitboxes";
import { Position } from "./position";
export interface Recruit {
	type: string;
	hitbox: HitBox;
}

export class Physic {
	static getDistance(positionA: Position, positionB: Position) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return Math.sqrt(differentialX ** 2 + differentialY ** 2);
	}

	static getDistanceSqrd(positionA: Position, positionB: Position) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return differentialX ** 2 + differentialY ** 2;
	}

	static getTheta(positionA: Position, positionB: Position) {
		const differentialX = positionB.x - positionA.x;
		const differentialY = positionB.y - positionA.y;
		return Math.atan2(differentialY, differentialX);
	}

	static getVector(positionA: Position, positionB: Position) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		const distanceSquared = differentialX ** 2 + differentialY ** 2;
		const distance = Math.sqrt(distanceSquared);
		const theta = Math.atan2(differentialY, differentialX);
		return { distance, theta };
	}

	static getVectorSqrd(positionA: Position, positionB: Position) {
		const differentialX = positionA.x - positionB.x;
		const differentialY = positionA.y - positionB.y;
		return {
			distance: differentialX ** 2 + differentialY ** 2,
			theta: Math.atan2(differentialY, differentialX),
		};
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

	static getNextPositionAndOrientation(position: Position, destination: Position, speed: number) {
		const theta = Physic.getTheta(position, destination);
		const nextPosition = new Position({
			x: position.x + Math.cos(theta) * speed,
			y: position.y + Math.sin(theta) * speed,
		});
		const differential = Physic.getDistanceSqrd(destination, position);

		if (differential < speed * speed) {
			return [destination, theta] as const;
		}
		return [nextPosition, theta] as const;
	}

	static doCollide(entityPosition: Position, hitbox: HitBox, point: Position) {
		for (const [shape, shapeRelativePosition] of hitbox.hitShapes) {
			const shapePosition = new Position({
				x: entityPosition.x + shapeRelativePosition.x,
				y: entityPosition.y + shapeRelativePosition.y,
			});
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

	static doHitboxsCollide(
		elementPosition: Position,
		hitbox: HitBox,
		otherElementPosition: Position,
		otherHitBox: HitBox,
	) {
		for (const [shape, position] of hitbox.hitShapes) {
			const shapePosition = new Position({
				x: elementPosition.x + position.x,
				y: elementPosition.y + position.y,
			});
			for (const [otherShape, otherShapeRelativePosition] of otherHitBox.hitShapes) {
				const otherShapePosition = new Position({
					x: otherElementPosition.x + otherShapeRelativePosition.x,
					y: otherElementPosition.y + otherShapeRelativePosition.y,
				});
				if (shape instanceof Rectangle && otherShape instanceof Rectangle) {
					// check for square collision
					const x1 = shapePosition.x - shape.w / 2;
					const y1 = shapePosition.y - shape.h / 2;
					const x2 = otherShapePosition.x - otherShape.w / 2;
					const y2 = otherShapePosition.y - otherShape.h / 2;

					if (x1 < x2 + otherShape.w && x1 + shape.w > x2 && y1 < y2 + otherShape.h && y1 + shape.h > y2) {
						return true;
					}
				}
				if (shape instanceof Ellipse && otherShape instanceof Ellipse) {
					// check for circle collision
					const dx = otherShapePosition.x - shapePosition.x;
					const dy = otherShapePosition.y - shapePosition.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					// Check if the distance is less than the sum of the radii
					return distance < shape.rx + otherShape.rx && distance < shape.rx + otherShape.ry;
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
					return distance <= COLLISION_THRESHOLD;
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
					return distance <= COLLISION_THRESHOLD;
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
