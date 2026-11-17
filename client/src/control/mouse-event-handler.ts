import { CanvasRenderer, PercentToReal } from "../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../shared/position";
import { InputToIntent } from "./input-to-intent-translator";

export type MouseEventType = "down" | "up" | "move" | "right-click";

export class MouseEventHandler {
	constructor(
		private readonly renderer: CanvasRenderer,
		private readonly inputToIntentTranslator: InputToIntent,
	) {
		// Presses start a gesture only inside the game area, so clicks on the side menu stay out of the game. Moves and
		// releases are read on the whole window, so a drag keeps going when the cursor leaves the canvas.
		renderer.container.addEventListener("mousedown", (event) => {
			if (event.button === 2) return;
			this.onMouseEvent(event, "down");
		});

		window.addEventListener("mouseup", (event) => {
			if (event.button === 2) return;
			this.onMouseEvent(event, "up");
		});
		window.addEventListener("mousemove", (event) => this.onMouseEvent(event, "move"));
		renderer.container.addEventListener("contextmenu", (event) => {
			event.preventDefault();
			this.onMouseEvent(event, "right-click");
		});
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
