import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";
import { Orientable } from "../engine/core/orientable";

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

export const TImageDrawable = (
	image: HTMLImageElement | HTMLImageElementAsset,
	size: { width: number; height: number },
	priority: number,
) =>
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
				const angle = (orientation + 2 * Math.PI) % (2 * Math.PI);
				if (
					(angle > Math.PI / 4 && angle <= (3 * Math.PI) / 4) ||
					(angle > (5 * Math.PI) / 4 && angle <= (7 * Math.PI) / 4)
				) {
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
				const angle = (orientation + 2 * Math.PI) % (2 * Math.PI);
				if (this.constructor.name.includes("BattleElfCastle")) {
					console.log("angle elf Castle", angle);
				}
				const threshold = Math.PI / 2;
				if (angle <= 0 + 0.1) {
					return assets.rightView;
				}
				if (angle <= threshold + 0.1) {
					return assets.backView;
				}
				if (angle <= 2 * threshold + 0.1) {
					return assets.leftView;
				}
				if (angle <= 3 * threshold + 0.1) {
					return assets.frontView;
				}
				if (angle <= 4 * threshold + 0.1) {
					return assets.leftView;
				}
				throw new Error("Invalid angle");
			}

			get drawPriority() {
				return this.drawable.priority;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const orientation = implementsTrait(this, Orientable) ? this.orientation : 0;
				const { width, height } = this.getProportion(orientation);
				const size = this.getCanvasSize(context, width, height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
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
