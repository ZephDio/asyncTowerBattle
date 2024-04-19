import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";

export const TImageDrawable = (image: HTMLImageElement, size: { width: number; height: number }, priority: number) =>
	Subtrait([TDrawable], (base) => {
		abstract class TImageDrawable extends base {
			angle: number = 0;
			drawable = {
				image: image,
				size: size,
				priority: priority,
			};

			get drawPriority() {
				return this.drawable.priority;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const { width, height } = this.drawable.size;
				const size = this.getCanvasSize(context, width, height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				this.drawImage(context, size, canvasPosition, this.drawable.image, this.angle);
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
