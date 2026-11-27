import { ImplementsTrait, Subtrait, implementsTrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";
import { Orientable } from "../engine/core/orientable";
import { Size } from "../../size";
import { TImageVariant } from "./image-variant";
import { TSpriteAnimation } from "./sprite-animation";
import { TBoardOriented } from "../engine/core/board-orientation";

export enum DrawPriority {
	BackGroundScreen = 0,
	BackGroundGrid = 1,
	CarpetStyleGridElement = 2,
	// Effects lying on the ground (fallen antler, poison): over the path tiles, which they can straddle, under pieces
	GroundEffect = 2.5,
	NormalGridElement = 3,
	FlyingGridElement = 4,
	HUD = 5,
	HoverHUD = 6,
	Menu = 7,
}

// How a piece's image is drawn on the opponent's board, where its footprint is mirrored through a point.
export enum EnemyRender {
	// Drawn as on the ally board, or with its own image for the opponent's view when the piece has one: a building
	// redrawn as the other player sees it (the Butchery), instead of turned by π.
	Normal = "normal",
	// Flipped left to right, for pieces whose details depend on their side.
	AxeFlip = "axe-flip",
	// Turned by π (flipped on both axes), for complex shapes that a single flip would not suit.
	FullFlip = "full-flip",
}

export const TImageDrawable = (
	image: HTMLImageElement,
	size: Size,
	priority: number,
	enemyRender: EnemyRender = EnemyRender.Normal,
	enemyImage?: HTMLImageElement,
) =>
	Subtrait([TDrawable], (base) => {
		abstract class TImageDrawable extends base {
			drawable = {
				image: image,
				size: size,
				priority: priority,
				enemyRender: enemyRender,
				enemyImage: enemyImage,
			};

			get drawPriority() {
				return this.drawable.priority;
			}

			// A mirrored piece turns by π around its footprint's centre only if it asks for a full flip, a projectile faces
			// its flight angle.
			getImageAngle() {
				if (implementsTrait(this, TBoardOriented)) {
					return this.mirrored && this.drawable.enemyRender === EnemyRender.FullFlip ? Math.PI : undefined;
				}
				if (implementsTrait(this, Orientable)) return this.orientation;
				return undefined;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				if (
					implementsTrait(this, TBoardOriented) &&
					this.mirrored &&
					this.drawable.enemyRender === EnemyRender.AxeFlip
				) {
					const center = this.getCanvasPosition(context, position);
					context.save();
					context.translate(center.x, center.y);
					context.scale(-1, 1);
					context.translate(-center.x, -center.y);
					this.drawUnflipped(context, position, scale);
					context.restore();
					return;
				}
				this.drawUnflipped(context, position, scale);
			}

			private drawUnflipped(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const size = this.getCanvasSize(context, this.drawable.size.width, this.drawable.size.height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				const sprite = implementsTrait(this, TSpriteAnimation) ? this.getSpriteFrame() : null;
				if (sprite) {
					this.drawImage(context, size, canvasPosition, sprite.image, this.getImageAngle(), sprite.frame);
					return;
				}
				const variant = implementsTrait(this, TImageVariant) ? this.getImageVariant() : null;
				if (variant) {
					this.drawImage(context, size, canvasPosition, variant.image, variant.theta);
					return;
				}
				const enemyImage =
					implementsTrait(this, TBoardOriented) && this.mirrored ? this.drawable.enemyImage : undefined;
				this.drawImage(context, size, canvasPosition, enemyImage ?? this.drawable.image, this.getImageAngle());
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
