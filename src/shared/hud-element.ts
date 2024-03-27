import { PercentToReal } from "../renderer/implementation/canvas-renderer";
import { HitBox, HitShape } from "./hitboxes";
import { Position } from "./position";
import { Size } from "./size";

export abstract class HudElement {
	abstract type: string;
	abstract position: Position;
	abstract size: Size;

	abstract hitbox: HitBox;
}

export class StartBattleButton extends HudElement {
	public type = "startBattle";
	public position = PercentToReal({ x: 50, y: 90 });

	public size = { width: 12, height: 6 };

	public hitbox = new HitBox([[new HitShape("rectangle", this.size), { x: 0, y: 0 }]]);
}
