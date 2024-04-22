import { Derive, ImplementsTrait } from "@ddd-ts/traits";
import { TCollider } from "../../traits/engine/core/TCollider";
import { THitbox } from "../../traits/engine/core/THitbox";
import { HitBox } from "../../hitbox/hitboxe";
import { Rectangle } from "../../hitbox/shapes/rectangle";
import { GridPosition, ScreenPosition } from "../../position";
import { TRenderable } from "../../traits/render/renderable";
import { Resources } from "../../../renderer/resources";
import { TImageDrawable } from "../../traits/render/image-drawable";
import { TGrid } from "../../../engine/grid/tgrid";
import { Size } from "../../size";

const speedMap = {
	0: 0,
	1: 0.2,
	2: 0.4,
	3: 0.6,
	4: 0.8,
	5: 1,
	6: 1.4,
	7: 1.6,
	8: 1.8,
	9: 2,
	10: 2.2,
	11: 2.4,
	12: 2.6,
	13: 2.8,
	14: 3,
	15: 3.5,
	16: 4,
};

export class SliderBattleSpeed extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 16, height: 2.5 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.hudElement.slider.resource.image, { width: 16, height: 1.8 }, 8),
	TRenderable,
) {
	override drawPriority = 8;
	size = { width: 16, height: 2.5 };

	focused: boolean = false;

	leftLimit: number;
	rightLimit: number;

	timesOnePos: number;
	cursor: Cursor;
	speedIndicator : SpeedIndicator
	constructor(
		public position: ScreenPosition,
		public changeSpeed: (speed: number) => void,
	) {
		super({});
		this.leftLimit = this.position.x - this.size.width / 2;
		this.rightLimit = this.position.x + this.size.width / 2;
		this.timesOnePos = this.position.x - 3;
		this.cursor = new Cursor(new ScreenPosition({ x: this.timesOnePos, y: this.position.y }));
		this.speedIndicator = new SpeedIndicator(
			this.position.add(new GridPosition({ x : 0, y : -2.8})),
			{ width : this.size.width , height : this.size.height *0.8}, 
			this.getSpeed.bind(this))
	}

	moveCursor(screenPosition: ScreenPosition) {
		if (screenPosition.x <= this.leftLimit) {
			this.cursor.move(this.leftLimit);
			this.changeSpeed(this.getSpeed());
			return;
		}
		if (screenPosition.x >= this.rightLimit) {
			this.cursor.move(this.rightLimit);
			this.changeSpeed(this.getSpeed());
			return;
		}
		this.cursor.move(screenPosition.x);
		this.changeSpeed(this.getSpeed());
	}

	getSpeed() {
		const key = (this.cursor.position.x - this.leftLimit) as keyof typeof speedMap;
		const speed = speedMap[key];
		return speed ?? 1;
	}

	override render(context: CanvasRenderingContext2D, grid?: ImplementsTrait<typeof TGrid> | undefined): void {
		super.render(context, grid);
		this.cursor.render(context, grid);
		this.speedIndicator.render(context,grid)
	}
}

class Cursor extends Derive(
	TCollider,
	THitbox(new HitBox([[new Rectangle({ width: 2, height: 2 }), new ScreenPosition({ x: 0, y: 0 })]])),
	TImageDrawable(Resources.hudElement.cursor.resource.image, { width: 2, height: 2.6 }, 9),
	TRenderable,
) {
	constructor(public position: ScreenPosition) {
		super({});
	}

	move(screenPositionX: number) {
		this.position.x = Math.round(screenPositionX);
	}
}

class SpeedIndicator extends Derive(TRenderable){

	drawPriority = 9
	constructor(public position : ScreenPosition, public size :Size,public getSpeed : () => number){
		super({})
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		context.fillStyle = "black";
		const size = this.getCanvasSize(context,this.size.width, this.size.height, scale)
		context.font = `${size.height}px Arial`;
		const canvasPosition = this.getCanvasPosition(context, position);
		const speed = this.getSpeed()
		context.textAlign = "center";
		context.fillText(
			`X ${speed}`,
			canvasPosition.x,
			canvasPosition.y,
		);
	}
}
