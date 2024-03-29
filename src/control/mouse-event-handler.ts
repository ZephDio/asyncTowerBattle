import { CanvasRenderer, PercentToReal } from "../renderer/implementation/canvas-renderer";
import { Position } from "../shared/position";
import { InputToIntentTranslator } from "./input-to-intent-translator";

export class MouseEventHandler {
	constructor(
		private readonly renderer: CanvasRenderer,
		private readonly inputToIntentTranslator: InputToIntentTranslator,
	) {
		window.addEventListener("click", (event) => this.onClick(event));
		window.addEventListener("mousedown", (event) => this.onMouseDown(event));
		window.addEventListener("mouseup", (event) => this.onMouseUp(event));
		window.addEventListener("mousemove", (event) => this.onMouseMove(event));
	}

	onMouseDown(event: MouseEvent) {
		const mousePosition = { x: event.x, y: event.y };
		const relativePosition = this.pixelPositionToRelative(mousePosition);
		this.inputToIntentTranslator.translateMouseDownInput(relativePosition);
	}

	onMouseMove(event: MouseEvent) {
		const mousePosition = { x: event.x, y: event.y };
		const relativePosition = this.pixelPositionToRelative(mousePosition);
		this.inputToIntentTranslator.translateMouseMoveInput(relativePosition);
	}

	onClick(event: MouseEvent): void {
		const mousePosition = { x: event.x, y: event.y };
		const relativePosition = this.pixelPositionToRelative(mousePosition);
		this.inputToIntentTranslator.translateClickInput(relativePosition);
	}

	onMouseUp(_event: MouseEvent): any {
		// const mousePosition = { x: event.x, y: event.y };
		// const relativePosition = this.pixelPositionToRelative(mousePosition);
		this.inputToIntentTranslator.translateMouseReleaseInput();
	}

	pixelPositionToRelative(position: Position) {
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
		return relativePosition;
	}
}
