import { Game } from "../../engine/game";
import { Position } from "../../shared/position";
import { Renderer } from "../renderer";

export const proportion = 16 / 9.8;

/**
 * Path: the road to castle
 * Tile: a square of the Path
 *
 * Grid: a rectangle of
 *
 */
export const PercentToReal = (position: { x: number; y: number }) => {
	return new Position({
		x: position.x,
		y: position.y / proportion,
	});
};
export class CanvasRenderer implements Renderer {
	public container: HTMLElement;
	public canvas: HTMLCanvasElement;
	public context: CanvasRenderingContext2D;
	constructor(public game: Game) {
		this.container = document.getElementById("container") as HTMLElement;
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const context = this.canvas.getContext("2d");
		if (!context) throw new Error();
		this.context = context;
	}

	async draw() {
		const { drawables, grid } = this.game.getRenderState();
		// const drawableState = this.stateToDrawable(state);
		this.drawBackGround();
		drawables
			.sort((drawableA, drawableB) => drawableA.drawPriority - drawableB.drawPriority)
			.map((drawable) => drawable.render(this.context, grid));
	}

	getCanvasPosition(position: Position) {
		const x = (this.canvas.width / 100) * position.x;
		const y = this.canvas.height - (this.canvas.width / 100) * position.y; // !
		return { x, y };
	}

	drawBackGround() {
		this.context.fillStyle = "#A65";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	init() {
		const render = async () => {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.sizeGame();
			this.draw();
			await new Promise((res: any) => setTimeout(() => res(), 1));
			window.requestAnimationFrame(render);
		};
		render();
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

	getCanvasSize(width: number, height: number) {
		const cWidth = (this.canvas.width / 100) * width;
		const cHeight = (this.canvas.width / 100) * height;
		return { width: cWidth, height: cHeight };
	}
}
