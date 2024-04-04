import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Position } from "./position";
import { Physic } from "./physic";


export class HitBox {
	constructor(public hitShapes: [HitShapeType, Position][]) { }
}
export class Rectangle{
	w : number
	h : number
	constructor(size :{ width : number, height : number}){
		this.w = size.width
		this.h = size.height
	}
 }
 export class Ellipse{
	rx : number
	ry : number
	constructor(size :{ width : number, height : number}){
		this.rx = size.width / 2
		this.ry = size.height / 2
	}
 }
type HitShapeType = Rectangle | Ellipse;

export const TCollider = (hitbox: HitBox) => Trait(base => {
	abstract class ICollider extends base {
		body = hitbox;
		abstract position: Position;

		contains(point: Position) {
			return Physic.doCollide(this.position, this.body, point);
		}

		intersects(other: ImplementsTrait<ReturnType<typeof TCollider>>) {
			return Physic.doHitboxsCollide(this.position, this.body, other.position, other.body)
		}
	}

	return ICollider;
})


