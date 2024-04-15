import { Subtrait } from "@ddd-ts/traits";
import { TGCollider } from "../../shared/traits/engine/core/TGCollider";
import { THitbox } from "../../shared/traits/engine/core/THitbox";
import { HitBox } from "../../shared/hitbox/hitboxe";
import { Rectangle } from "../../shared/hitbox/shapes/rectangle";
import { GridPosition } from "../../shared/position";
import { TRenderable } from "../../shared/traits/render/renderable";

export const TEnvironmentElement = Subtrait(
	[
		TGCollider,
		THitbox(new HitBox([[new Rectangle({ width: 4, height: 4 }), new GridPosition({ x: 0, y: 0 })]])),
		TRenderable,
	],
	(base) => {
		abstract class IEnvironmentElement extends base {}

		return IEnvironmentElement;
	},
);
