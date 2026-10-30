import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";
import { Direction, Orientable, toDirection } from "../engine/core/orientable";
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

export type HTMLImageElementAsset = {
	frontView: HTMLImageElement;
	backView: HTMLImageElement;
	leftView: HTMLImageElement;
	rightView: HTMLImageElement;
};

// Facing down means facing the camera, so the front of the element is seen
const VIEW_BY_DIRECTION: Record<Direction, keyof HTMLImageElementAsset> = {
	right: "rightView",
	up: "backView",
	left: "leftView",
	down: "frontView",
};

export const TImageDrawable = (image: HTMLImageElement | HTMLImageElementAsset, size: Size, priority: number) =>
	Subtrait([TDrawable], (base) => {
		abstract class TImageDrawable extends base {
			drawable = {
				image: image,
				size: size,
				priority: priority,
			};

			getProportion(orientation: number) {
				if (this.drawable.image instanceof HTMLImageElement) {
					return this.drawable.size;
				}
				const view = this.getView(orientation);
				const front = this.drawable.image.frontView;
				if (view.naturalWidth && front.naturalWidth) {
					// Swap the size only when this view is turned against the front one (side of a house, not of a round tower)
					const turned = view.naturalWidth > view.naturalHeight !== front.naturalWidth > front.naturalHeight;
					const { width, height } = this.drawable.size;
					return turned ? { width: height, height: width } : { width, height };
				}
				const direction = toDirection(orientation);
				if (direction === "up" || direction === "down") {
					return {
						width: this.drawable.size.width,
						height: this.drawable.size.height,
					};
				}
				return {
					width: this.drawable.size.height,
					height: this.drawable.size.width,
				};
			}

			getView(orientation: number) {
				const assets = this.drawable.image;
				if (assets instanceof HTMLImageElement) {
					return assets;
				}
				return assets[VIEW_BY_DIRECTION[toDirection(orientation)]];
			}

			get drawPriority() {
				return this.drawable.priority;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const orientation = implementsTrait(this, Orientable)
					? this.orientation
					: implementsTrait(this, TBoardOriented)
						? this.mirrored
							? Math.PI / 2
							: (3 * Math.PI) / 2
						: 0;
				const { width, height } = this.getProportion(orientation);
				const size = this.getCanvasSize(context, width, height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				const variant = implementsTrait(this, TImageVariant) ? this.getImageVariant() : null;
				if (variant) {
					this.drawImage(context, size, canvasPosition, variant.image, variant.theta);
					return;
				}
				const image = this.getView(orientation);
				if (this.drawable.image instanceof HTMLImageElement) {
					this.drawImage(context, size, canvasPosition, image, orientation);
					return;
				}
				this.drawImage(context, size, canvasPosition, image);
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
