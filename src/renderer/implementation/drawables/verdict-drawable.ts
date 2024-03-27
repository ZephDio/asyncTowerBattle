import { BattleVerdict } from "../../../engine/battle-summary/battle-summary";
import { Position } from "../../../shared/position";
import { Size } from "../../../shared/size";
import { Resources } from "../../resources";
import { Drawable } from "./drawable";

export class VerdictDrawable extends Drawable {
	drawPriority: number = 2;
	image: HTMLImageElement;
	constructor(
		public verdict: BattleVerdict,
		public size: Size,
		public position: Position,
	) {
		super();
		this.image = Resources.verdict[verdict].resource.image;
	}
	draw(context: CanvasRenderingContext2D) {
		this.drawImage(context, this.size, this.position, this.image);
	}
}
