import { ImplementsTrait, Subtrait } from "@ddd-ts/traits";
import { ScreenPosition } from "../../position";

import { TDrawable } from "./drawable";



export type HTMLImageElementAsset = {
	frontView : HTMLImageElement
	backView : HTMLImageElement
	leftView : HTMLImageElement
	rightView : HTMLImageElement
}

export const TImageDrawable = (image: HTMLImageElement | HTMLImageElementAsset, size: { width: number; height: number }, priority: number) =>
	Subtrait([TDrawable], (base) => {
		abstract class TImageDrawable extends base {
			angle: number = 0
			drawable = {
				image: image,
				size: size,
				priority: priority,
			};

			getProportion(){
				if(this.drawable.image instanceof HTMLImageElement){
					return this.drawable.size
				}
				const angle = (this.angle + 2 * Math.PI) % 2 * Math.PI
				if(angle % Math.PI > 0 && angle % Math.PI < Math.PI/2){
					return {
						width: this.drawable.size.height,
						height: this.drawable.size.width
					}
				}
				return {
					width: this.drawable.size.width,
					height: this.drawable.size.height
				}
			}

			getView(){
				const assets = this.drawable.image
				if(assets instanceof HTMLImageElement){
					return assets
				}
				const angle = (this.angle + 2 * Math.PI) % 2 * Math.PI
				const threshold = Math.PI / 2
				if (angle <= 0 +0.1) {
					return assets.backView;
				} 
				if (angle <= threshold + 0.1) {
					return assets.rightView;
				} 
				if (angle <= 2 * threshold + 0.1) {
					return assets.frontView;
				} 
				if (angle <= 3 * threshold + 0.1){
					return assets.leftView;
				}
				if (angle <= 4 * threshold + 0.1){
					return assets.backView
				}
				throw new Error("Invalid angle")
			}

			get drawPriority() {
				return this.drawable.priority;
			}

			draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
				const { width, height } = this.getProportion();
				const size = this.getCanvasSize(context, width, height, scale);
				const canvasPosition = this.getCanvasPosition(context, position);
				const image = this.getView()
				if(this.drawable.image instanceof HTMLImageElement){
					this.drawImage(context, size, canvasPosition, image, this.angle);
					return
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
