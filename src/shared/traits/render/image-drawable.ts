import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";
import { Orientable } from "../engine/core/orientable";
import { Size } from "../../size";
import { TImageVariant } from "./image-variant";
import { TBoardOriented } from "../engine/core/board-orientation";

export enum DrawPriority {
	BackGroundScreen = 0,
	BackGroundGrid = 1,
	CarpetStyleGridElement = 2,
	NormalGridElement = 3,
	FlyingGridElement = 4,
	HUD = 5,
	HoverHUD = 6,
	Menu = 7,
}

export const TImageDrawable = (image: HTMLImageElement, size: Size, priority: number) =>
	Subtrait([TDrawable], (base) => {
		abstract class TImageDrawable extends base {
			drawable = {
				image: image,
				size: size,
				priority: priority,
			};

			get drawPriority() {
				return this.drawable.priority;
			}

			// A mirrored piece turns by π around its footprint's centre, a projectile faces its flight angle.
			getImageAngle() {
				if (implementsTrait(this, TBoardOriented)) return this.mirrored ? Math.PI : undefined;
				if (implementsTrait(this, Orientable)) return this.orientation;
				return undefined;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const size = this.getCanvasSize(context, this.drawable.size.width, this.drawable.size.height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				const variant = implementsTrait(this, TImageVariant) ? this.getImageVariant() : null;
				if (variant) {
					this.drawImage(context, size, canvasPosition, variant.image, variant.theta);
					return;
				}
				this.drawImage(context, size, canvasPosition, this.drawable.image, this.getImageAngle());
			}
		}
		return TImageDrawable;
	});

export const HTImageDrawable = Subtrait([TImageDrawable(new Image(), { width: 0, height: 0 }, 0)], (base, Props) => {
	return class HTImageDrawable extends base {
		constructor(props: { imageDrawable: ImplementsTrait<ReturnType<typeof TImageDrawable>> } & typeof Props) {
			super(props);
			this.draw = props.imageDrawable.draw;
			this.drawable = props.imageDrawable.drawable;
		}
	};
});
