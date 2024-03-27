import { Recruit } from "../../../shared/physic";
import { Buyable } from "../../../engine/shop/shop";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class BuyableDrawable extends Drawable<Buyable<Recruit>> {
	drawPriority: number = 2;
	image: HTMLImageElement;
	constructor(
		public buyable: Buyable<Recruit>,
		public size: Size,
		public position: Position,
	) {
		super();
		this.image = new Image(size.width, size.height);
		this.image.src = Resources[buyable.type][buyable.entity.type].resource.src;
	}
	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
