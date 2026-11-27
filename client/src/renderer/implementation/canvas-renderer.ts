import { GameWrapper } from "../../engine/wrap";
import { Cell, ScreenPosition } from "../../shared/position";
import { Size } from "../../shared/size";
import { Renderer } from "../renderer";

export const proportion = 16 / 9.8;

export const PercentToReal = (position: { x: number; y: number }) => {
	return new ScreenPosition({
		x: position.x,
		y: position.y / proportion,
	});
};

export function getRelativePositionPercent(position: ScreenPosition, size: Size, percent: { x: number; y: number }) {
	return new ScreenPosition({
		x: position.x + (size.width / 100) * (percent.x - 50),
		y: position.y + (size.height / 100) * (percent.y - 50),
	});
}

export class CanvasRenderer implements Renderer {
	public context: CanvasRenderingContext2D;
	constructor(
		public gameWrap: GameWrapper,
		public container: HTMLElement,
		public canvas: HTMLCanvasElement,
	) {
		const context = this.canvas.getContext("2d");
		if (!context) throw new Error();
		this.context = context;
	}

	async draw() {
		const { grids, renderables, backdrops = [] } = this.gameWrap.getRenderState();
		this.drawBackGround();
		for (const backdrop of backdrops) backdrop.render(this.context);
		for (const { grid, drawables } of grids) {
			grid.render(this.context);
			const gridElementDrawables = grid.getDrawables();
			[...gridElementDrawables, ...drawables]
				.sort((drawableA, drawableB) => {
					let positionA = drawableA.position.clone();
					let positionB = drawableB.position.clone();
					if (drawableA.position instanceof Cell) {
						positionA = grid.cellToGrid(drawableA.position);
					}
					if (drawableB.position instanceof Cell) {
						positionB = grid.cellToGrid(drawableB.position);
					}
					return positionB.y - positionA.y;
				})
				.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority)
				.map((drawable) => drawable.render(this.context, grid));
		}
		// A grid hover effect can leave the context translucent; the HUDs on top are drawn opaque.
		this.context.globalAlpha = 1;
		renderables
			.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority)
			.map((drawable) => drawable.render(this.context));
	}

	drawBackGround() {
		this.context.fillStyle = "#A65";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private stopped = false;

	// Ends the draw loop; a frame already waiting does not draw again.
	stop() {
		this.stopped = true;
	}

	init() {
		const render = async () => {
			if (this.stopped) return;
			const before = new Date();
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.sizeGame();
			await this.draw();
			if (this.stopped) return;
			const after = new Date();
			const diff = after.getTime() - before.getTime();
			await new Promise((res: any) => setTimeout(() => res(), 15 - diff));
			if (this.stopped) return;
			window.requestAnimationFrame(render);
		};
		render();
	}

	// The canvas's top left corner in page pixels. offsetLeft/offsetTop would be relative to the nearest positioned
	// ancestor, which the React layout around the canvas can introduce.
	pageOrigin() {
		const { left, top } = this.canvas.getBoundingClientRect();
		return { x: left, y: top };
	}

	sizeGame() {
		const { width, height } = this.container.getBoundingClientRect();
		if (width > height * proportion) {
			this.canvas.height = height;
			this.canvas.width = height * proportion;
			return;
		}
		this.canvas.width = width;
		this.canvas.height = width / proportion;
	}
}
