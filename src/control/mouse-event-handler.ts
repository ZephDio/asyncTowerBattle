import { CanvasRenderer, PercentToReal } from "../renderer/implementation/canvas-renderer";
import { ScreenPosition } from "../shared/position";
import { InputToIntent } from "./input-to-intent-translator";

export type MouseEventType = "down" | "up" | "move";

export class MouseEventHandler {
	constructor(
		private readonly renderer: CanvasRenderer,
		private readonly inputToIntentTranslator: InputToIntent,
	) {
		window.addEventListener("mousedown", (event) => this.onMouseEvent(event, "down"));
		window.addEventListener("mouseup", (event) => this.onMouseEvent(event, "up"));
		window.addEventListener("mousemove", (event) => this.onMouseEvent(event, "move"));
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
		const { offsetLeft, offsetTop } = this.renderer.canvas;
		const { width, height } = this.renderer.canvas;
		const pixelPosition = {
			x: position.x - offsetLeft,
			y: position.y - offsetTop,
		};
		const relativePosition = PercentToReal({
			x: pixelPosition.x / (width / 100),
			y: 100 - pixelPosition.y / (height / 100),
		});
		// const shape = new HitShape("ellipse", { width: 5, height: 5 });
		return new ScreenPosition(relativePosition);
	}
}
