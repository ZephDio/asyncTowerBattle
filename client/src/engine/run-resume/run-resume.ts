import { Army } from "../army/army";
import { Game } from "../game";
import { ScreenPosition } from "../../shared/position";
import { RenderableState } from "../../renderer/renderer";
import { ResumeState } from "../../shared/gamestate";
import { ContinueHud } from "./continue-hud";
import { RunResumeScroll, RunResult } from "./run-resume-scroll";

// Where the army grid rests on the scroll, and the continue button under it.
const GRID_CENTER = new ScreenPosition({ x: 52, y: 21 });
const CONTINUE_POSITION = new ScreenPosition({ x: 50, y: 6.2 });

// The last phase of a run: the player sees their board one last time. Nothing can be moved, only described.
export class RunResume {
	readonly continueHud = new ContinueHud(CONTINUE_POSITION);
	private scroll: RunResumeScroll;

	constructor(
		public army: Army,
		result: RunResult,
		public onContinue: Game["handleResumeQuit"],
		public setDescriptionHud: Game["setDescriptionHud"],
	) {
		this.scroll = new RunResumeScroll(result);
		const grid = army.grid;
		grid.centerPosition = GRID_CENTER.clone();
		grid.updateCornerPosition();
		this.clearHover();
	}

	clearHover() {
		this.army.grid.clearSynergiesTiles();
		this.army.grid.setOveredTile(null);
	}

	continue() {
		this.setDescriptionHud(null);
		this.onContinue();
	}

	getDrawables(): RenderableState {
		return {
			backdrops: [this.scroll],
			grids: [{ grid: this.army.grid, drawables: [] }],
			renderables: [this.continueHud],
		};
	}

	getState(): ResumeState {
		return { type: "resume", grid: this.army.grid, hudElements: [this.continueHud] };
	}
}
