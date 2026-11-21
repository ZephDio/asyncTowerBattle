import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../grid/tgrid";
import type { AnyBattleUnit } from "../../units/battle/battle-unit";

// How far behind its front the streak trails, in cells.
const TRAIL_CELLS = 1.3;

// One beam of the lighthouse: a streak of light that sweeps a straight line of cells, in order, in `sweepTicks`
// battle ticks. Each tick it lights one cell (the cells share the sweep evenly) and hits the enemy units standing on
// it, each unit at most once. Then it fades for `fadeTicks` without hitting anything, and goes away.
export class LighthouseBeam extends Derive(TDrawable, TRenderable) {
	type = "lighthouse-beam" as const;
	drawPriority = DrawPriority.FlyingGridElement;
	clock = 0;
	private readonly hit = new Set<AnyBattleUnit>();
	// The unit vector of the sweep, in grid units, from the first cell to the last.
	private readonly direction: GridPosition;
	// Where the sweep starts: the outer edge of the first cell.
	private readonly start: GridPosition;

	constructor(
		// The battle cells of the beam, in sweep order. At least two, on a straight line.
		public readonly cells: Cell[],
		public readonly damage: number,
		private readonly sweepTicks: number,
		private readonly fadeTicks: number,
		private readonly hooks: BattleArmyHooks,
		private readonly onHit: (unit: AnyBattleUnit) => void,
	) {
		super({});
		const first = cells[0];
		const last = cells[cells.length - 1];
		if (!first || !last || cells.length < 2) throw new Error("A beam needs at least two cells");
		const length = Math.hypot(last.x - first.x, last.y - first.y);
		this.direction = new GridPosition({ x: (last.x - first.x) / length, y: (last.y - first.y) / length });
		const center = hooks.gridHooks.getRealPosition(first);
		this.start = new GridPosition({
			x: center.x - (this.direction.x * STANDARD_CELL_SIZE) / 2,
			y: center.y - (this.direction.y * STANDARD_CELL_SIZE) / 2,
		});
	}

	// The cell the sweep lights this tick, undefined once the sweep is over.
	get litCell(): Cell | undefined {
		if (this.clock >= this.sweepTicks) return undefined;
		return this.cells[Math.floor((this.clock * this.cells.length) / this.sweepTicks)];
	}

	// How far the front of the streak went from the start, in grid units.
	private get travelled() {
		return Math.min(this.clock / this.sweepTicks, 1) * this.cells.length * STANDARD_CELL_SIZE;
	}

	// The front of the streak.
	get position() {
		return new GridPosition({
			x: this.start.x + this.direction.x * this.travelled,
			y: this.start.y + this.direction.y * this.travelled,
		});
	}

	tick() {
		const cell = this.litCell;
		if (cell) this.light(cell);
		this.clock++;
		if (this.clock >= this.sweepTicks + this.fadeTicks) this.hooks.removeAreaEffect(this);
	}

	private light(cell: Cell) {
		for (const unit of this.enemiesOn(cell)) {
			if (this.hit.has(unit)) continue;
			this.hit.add(unit);
			unit.takeHit(this.damage);
			this.onHit(unit);
		}
	}

	// The living enemy units standing on the cell. The search goes through every enemy unit, and keeps none as its
	// target: the criteria collects them.
	private enemiesOn(cell: Cell) {
		const found: AnyBattleUnit[] = [];
		this.hooks.searchTarget(this.position, (unit) => {
			const at = this.hooks.gridHooks.getCell(unit.position);
			if (unit.isAlive() && at?.x === cell.x && at.y === cell.y) found.push(unit);
			return false;
		});
		return found;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const trail = Math.min(this.travelled, TRAIL_CELLS * STANDARD_CELL_SIZE);
		if (trail <= 0) return;
		const fading = this.clock - this.sweepTicks;
		const alpha = fading <= 0 ? 1 : Math.max(0, 1 - fading / this.fadeTicks);
		if (alpha <= 0) return;
		const front = this.getCanvasPosition(context, position);
		const length = this.getCanvasSize(context, trail, 0, scale).width;
		const width = this.getCanvasSize(context, STANDARD_CELL_SIZE * 0.6, 0, scale).width;
		// The canvas is y-down.
		const tail = { x: front.x - this.direction.x * length, y: front.y + this.direction.y * length };
		const gradient = context.createLinearGradient(tail.x, tail.y, front.x, front.y);
		gradient.addColorStop(0, "rgba(255, 240, 255, 0)");
		gradient.addColorStop(0.6, "rgba(255, 170, 240, 0.55)");
		gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");
		context.save();
		context.globalAlpha = alpha;
		context.lineCap = "round";
		context.strokeStyle = gradient;
		context.lineWidth = width;
		this.drawLine(context, tail.x, tail.y, front.x, front.y);
		context.lineWidth = width / 3;
		context.strokeStyle = "rgba(255, 255, 255, 0.9)";
		this.drawLine(context, tail.x + (front.x - tail.x) * 0.5, tail.y + (front.y - tail.y) * 0.5, front.x, front.y);
		context.restore();
	}
}
