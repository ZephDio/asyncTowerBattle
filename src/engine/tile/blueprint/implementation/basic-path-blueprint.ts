import { Derive } from "@ddd-ts/traits";
import { Resources } from "../../../../renderer/resources";
import { HitBox, Rectangle, THitbox } from "../../../../shared/hitboxes";
import { TImageDrawable } from "../../../../shared/traits/drawable";
import { Position } from "../../../../shared/position";

export class BasicTileBlueprint extends Derive(
	TImageDrawable(Resources.path.normal.image, { width: 4.9, height: 4.9 }, 2),
	THitbox(new HitBox([[new Rectangle({ width: 4.9, height: 4.9 }), new Position({ x: 0, y: 0 })]])),
) {}
