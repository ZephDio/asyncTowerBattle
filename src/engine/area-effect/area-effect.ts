import { HitBox } from "../../shared/hitboxes";
import { Position } from "../../shared/position";
import { Size } from "../../shared/size";

export abstract class AreaEffect {
	abstract type: string;
	abstract position: Position;
	abstract hitbox: HitBox;
	abstract size: Size;
	abstract tick(): void;
}
