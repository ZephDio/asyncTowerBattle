import { implementsTrait } from "@ddd-ts/traits";
import { RunResume } from "../../engine/run-resume/run-resume";
import { ScreenPosition } from "../../shared/position";
import { DescriptionHud, TDescriptor } from "../../shared/traits/render/huds/item-descriptor";
import { MouseEventType } from "../mouse-event-handler";
import { ShopInputToIntentTranslator } from "./shop-input-translator";

// The board is only looked at: hovering describes, nothing is picked up.
export class RunResumeInputToIntentTranslator {
	private shopTranslator = new ShopInputToIntentTranslator();

	handle(screenPosition: ScreenPosition, eventType: MouseEventType, resume: RunResume) {
		if (eventType === "down") {
			if (resume.continueHud.contains(screenPosition)) resume.continue();
			return;
		}
		if (eventType === "move") this.describe(screenPosition, resume);
	}

	private describe(screenPosition: ScreenPosition, resume: RunResume) {
		const grid = resume.army.grid;
		resume.clearHover();
		if (grid.isOverCastle(screenPosition)) {
			resume.setDescriptionHud(new DescriptionHud(resume.army.castle));
			return;
		}
		const cell = grid.gridPositionToCell(grid.screenToGridPosition(screenPosition));
		const element = cell ? grid.getElement(cell) : undefined;
		const described = element ? this.shopTranslator.unitOr(element, grid, screenPosition) : undefined;
		if (cell) grid.setOveredTile([cell]);
		resume.setDescriptionHud(
			described && implementsTrait(described, TDescriptor) ? new DescriptionHud(described) : null,
		);
	}
}
