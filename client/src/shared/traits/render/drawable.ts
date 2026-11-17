import { Trait } from "@ddd-ts/traits";
import { Size } from "../../size";
import { ScreenPosition } from "../../position";
import { SpriteFrame } from "../../sprite-sheet";

export const TDrawable = Trait((base) => {
	abstract class IDrawable extends base {
		abstract drawPriority: number;

		abstract draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void;

		protected drawEllipse(
			context: CanvasRenderingContext2D,
			size: Size,
			position: { x: number; y: number },
			scale: number = 1,
		) {
			context.beginPath();
			context.ellipse(position.x, position.y, (size.width / 2) * scale, (size.height / 2) * scale, 0, 0, 2 * Math.PI);
			context.fill();
			context.stroke();
		}
		protected drawRectangle(context: CanvasRenderingContext2D, size: Size, position: { x: number; y: number }) {
			context.beginPath();
			context.strokeRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
			context.fillRect(position.x - size.width / 2, position.y - size.height / 2, size.width, size.height);
			context.stroke();
		}
		protected drawLines(context: CanvasRenderingContext2D, points: ScreenPosition[]) {
			context.beginPath();
			for (const point of points) {
				context.lineTo(point.x, point.y);
			}
			context.stroke();
		}

		protected drawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
			context.beginPath();
			context.lineTo(x1, y1);
			context.lineTo(x2, y2);
			context.stroke();
		}

		protected getCanvasPosition(context: CanvasRenderingContext2D, position: ScreenPosition) {
			const x = (context.canvas.width / 100) * position.x;
			const y = context.canvas.height - (context.canvas.width / 100) * position.y;
			return { x, y };
		}

		protected drawArc(context: CanvasRenderingContext2D, x: number, y: number, size: Size, ratio: number) {
			context.beginPath();
			const from = -157 / 100; // -Math.PI /2
			const to = (-157 + 628 * ratio) / 100; // -Math.PI / 2 * (1 - ratio) + ratio * (Math.PI * 2 - Math.PI / 2);
			context.beginPath();
			context.arc(x, y, size.width / 2, from, to, false);
			context.stroke();
		}

		protected getCanvasSize(context: CanvasRenderingContext2D, width: number, height: number, scale: number = 1) {
			const cWidth = (context.canvas.width / 100) * width * scale;
			const cHeight = (context.canvas.width / 100) * height * scale;
			return { width: cWidth, height: cHeight };
		}

		protected drawImage(
			context: CanvasRenderingContext2D,
			size: Size,
			position: { x: number; y: number },
			image: HTMLImageElement,
			theta: number | undefined = undefined,
			frame: SpriteFrame | undefined = undefined,
		) {
			if (theta !== undefined) {
				context.save();
				context.translate(position.x, position.y);
				context.rotate(-theta); // canvas rotate clockwise
				this.drawImageFrame(context, image, frame, -size.width / 2, -size.height / 2, size);
				context.restore();
				return;
			}
			this.drawImageFrame(context, image, frame, position.x - size.width / 2, position.y - size.height / 2, size);
		}

		// Draws the whole image, or only the frame's rectangle of a sprite sheet.
		protected drawImageFrame(
			context: CanvasRenderingContext2D,
			image: HTMLImageElement,
			frame: SpriteFrame | undefined,
			x: number,
			y: number,
			size: Size,
		) {
			if (!frame) {
				context.drawImage(image, x, y, size.width, size.height);
				return;
			}
			context.drawImage(image, frame.x, frame.y, frame.w, frame.h, x, y, size.width, size.height);
		}
	}
	return IDrawable;
});
