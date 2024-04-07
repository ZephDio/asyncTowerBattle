import { Derive } from "@ddd-ts/traits";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { Position } from "../../../../shared/position";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Resources } from "../../../../renderer/resources";

export class SlowingTileBlueprint extends Derive(
	TImageDrawable(Resources.path.slowing.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]])),
) {}
