import { CanvasRenderer, PercentToReal } from "../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../shared/position";
import { InputToIntent } from "./input-to-intent-translator";

export type MouseEventType = "down" | "up" | "move" | "right-click";

export class MouseEventHandler {
	// Whether the left button went down inside the game area and is still held.
	private pressing = false;
	private readonly listeners = new AbortController();

	constructor(
		private readonly renderer: CanvasRenderer,
		private readonly inputToIntentTranslator: InputToIntent,
	) {
		// Presses start a gesture only inside the game area, so clicks on the side menu or the login screen stay out of
		// the game. Moves and releases are read on the whole window, so a drag keeps going when the cursor leaves the
		// canvas, but only reach the game during such a drag or, for moves, over the game area itself: an element
		// covering the canvas, such as the login screen, takes them.
		const { signal } = this.listeners;
		renderer.container.addEventListener(
			"mousedown",
			(event) => {
				if (event.button === 2) return;
				this.pressing = true;
				this.onMouseEvent(event, "down");
			},
			{ signal },
		);

		window.addEventListener(
			"mouseup",
			(event) => {
				if (event.button === 2 || !this.pressing) return;
				this.pressing = false;
				this.onMouseEvent(event, "up");
			},
			{ signal },
		);
		window.addEventListener(
			"mousemove",
			(event) => {
				if (this.pressing || this.isOverGame(event)) this.onMouseEvent(event, "move");
			},
			{ signal },
		);
		renderer.container.addEventListener(
			"contextmenu",
			(event) => {
				event.preventDefault();
				this.onMouseEvent(event, "right-click");
			},
			{ signal },
		);
	}

	dispose() {
		this.listeners.abort();
	}

	private isOverGame(event: MouseEvent) {
		return event.target instanceof Node && this.renderer.container.contains(event.target);
	}

	onMouseEvent(event: MouseEvent, type: MouseEventType) {
		const mousePosition = { x: event.x, y: event.y };
		const relativePosition = this.pixelPositionToRelative(mousePosition);
		this.inputToIntentTranslator.handle(relativePosition, type);
	}

	// onMouseMove(event: MouseEvent) {
	// 	const mousePosition = { x: event.x, y: event.y };
	// 	const relativePosition = this.pixelPositionToRelative(mousePosition);
	// 	this.inputToIntentTranslator.translateMouseMoveInput(relativePosition);
	// }

	// onClick(event: MouseEvent): void {
	// 	const mousePosition = { x: event.x, y: event.y };
	// 	const relativePosition = this.pixelPositionToRelative(mousePosition);
	// 	this.inputToIntentTranslator.translateClickInput(relativePosition);
	// }

	// onMouseUp(event: MouseEvent): any {
	// 	const mousePosition = { x: event.x, y: event.y };
	// 	const relativePosition = this.pixelPositionToRelative(mousePosition);
	// 	this.inputToIntentTranslator.translateMouseReleaseInput(relativePosition);
	// }

	pixelPositionToRelative(position: { x: number; y: number }) {
		const origin = this.renderer.pageOrigin();
		const { width, height } = this.renderer.canvas;
		const pixelPosition = {
			x: position.x - origin.x,
			y: position.y - origin.y,
		};
		const relativePosition = PercentToReal({
			x: pixelPosition.x / (width / 100),
			y: 100 - pixelPosition.y / (height / 100),
		});
		// const shape = new HitShape("ellipse", { width: 5, height: 5 });
		return new ScreenPosition(relativePosition);
	}
}
