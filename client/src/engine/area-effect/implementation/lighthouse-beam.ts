import { Derive } from "@ddd-ts/traits";
import { Cell, GridPosition, ScreenPosition } from "../../../shared/position";
import { BattleArmyHooks } from "../../army/battle/battle-army";
import { TDrawable } from "../../../shared/traits/render/drawable";
import { TRenderable } from "../../../shared/traits/render/renderable";
import { DrawPriority } from "../../../shared/traits/render/image-drawable";
import { STANDARD_CELL_SIZE } from "../../grid/tgrid";
import type { AnyBattleUnit } from "../../units/battle/battle-unit";

// How far behind the lit spot the swept line keeps glowing, in cells.
const TRAIL_CELLS = 1.3;
// The half widths of the ray, in cells: thin at the crystal, about a cell wide where it lands.
const RAY_HALF_WIDTH_AT_CRYSTAL = 0.08;
const RAY_HALF_WIDTH_AT_SPOT = 0.4;

// One beam of the lighthouse: a ray of light from the crystal that sweeps a straight line of cells, in order, in
// `sweepTicks` battle ticks. Each tick it lights one cell (the cells share the sweep evenly) and hits the enemy units
// standing on it, each unit at most once. Then it fades for `fadeTicks` without hitting anything, and goes away.
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
		// Where the ray comes from, the lighthouse's crystal. The beam is drawn from there.
		public readonly origin: GridPosition,
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

	// How far the lit spot went from the start, in grid units.
	private get travelled() {
		return Math.min(this.clock / this.sweepTicks, 1) * this.cells.length * STANDARD_CELL_SIZE;
	}

	// The spot the ray lands on, sliding along the line of cells.
	get spot() {
		return new GridPosition({
			x: this.start.x + this.direction.x * this.travelled,
			y: this.start.y + this.direction.y * this.travelled,
		});
	}

	// The beam is drawn from the crystal.
	get position() {
		return this.origin;
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
		this.hooks.searchTarget(this.spot, (unit) => {
			const at = this.hooks.gridHooks.getCell(unit.position);
			if (unit.isAlive() && at?.x === cell.x && at.y === cell.y) found.push(unit);
			return false;
		});
		return found;
	}

	draw(context: CanvasRenderingContext2D, position: ScreenPosition, scale: number): void {
		const fading = this.clock - this.sweepTicks;
		const alpha = fading <= 0 ? 1 : Math.max(0, 1 - fading / this.fadeTicks);
		if (alpha <= 0) return;
		// Grid units to canvas pixels; the canvas is y-down.
		const unit = this.getCanvasSize(context, 1, 0, scale).width;
		const crystal = this.getCanvasPosition(context, position);
		const toCanvas = (point: GridPosition) => ({
			x: crystal.x + (point.x - this.origin.x) * unit,
			y: crystal.y - (point.y - this.origin.y) * unit,
		});
		const spot = toCanvas(this.spot);
		context.save();
		context.globalAlpha = alpha;
		this.drawTrail(context, spot, unit);
		this.drawRay(context, crystal, spot, unit);
		this.drawSpot(context, spot, unit);
		context.restore();
	}

	// The part of the line the ray just swept, still glowing behind the spot.
	private drawTrail(context: CanvasRenderingContext2D, spot: { x: number; y: number }, unit: number) {
		const length = Math.min(this.travelled, TRAIL_CELLS * STANDARD_CELL_SIZE) * unit;
		if (length <= 0) return;
		const tail = { x: spot.x - this.direction.x * length, y: spot.y + this.direction.y * length };
		const gradient = context.createLinearGradient(tail.x, tail.y, spot.x, spot.y);
		gradient.addColorStop(0, "rgba(200, 245, 255, 0)");
		gradient.addColorStop(1, "rgba(200, 245, 255, 0.5)");
		context.lineCap = "round";
		context.strokeStyle = gradient;
		context.lineWidth = STANDARD_CELL_SIZE * 0.5 * unit;
		this.drawLine(context, tail.x, tail.y, spot.x, spot.y);
	}

	// A cone of light from the crystal to the spot, thin at the crystal and widening as it goes.
	private drawRay(
		context: CanvasRenderingContext2D,
		crystal: { x: number; y: number },
		spot: { x: number; y: number },
		unit: number,
	) {
		const length = Math.hypot(spot.x - crystal.x, spot.y - crystal.y);
		if (length <= 0) return;
		const across = { x: -(spot.y - crystal.y) / length, y: (spot.x - crystal.x) / length };
		const near = RAY_HALF_WIDTH_AT_CRYSTAL * STANDARD_CELL_SIZE * unit;
		const far = RAY_HALF_WIDTH_AT_SPOT * STANDARD_CELL_SIZE * unit;
		const gradient = context.createLinearGradient(crystal.x, crystal.y, spot.x, spot.y);
		gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
		gradient.addColorStop(0.5, "rgba(170, 235, 255, 0.45)");
		gradient.addColorStop(1, "rgba(140, 220, 255, 0.3)");
		context.fillStyle = gradient;
		context.beginPath();
		context.moveTo(crystal.x + across.x * near, crystal.y + across.y * near);
		context.lineTo(spot.x + across.x * far, spot.y + across.y * far);
		context.lineTo(spot.x - across.x * far, spot.y - across.y * far);
		context.lineTo(crystal.x - across.x * near, crystal.y - across.y * near);
		context.closePath();
		context.fill();
		// A bright core down the middle of the ray.
		context.strokeStyle = "rgba(255, 255, 255, 0.7)";
		context.lineWidth = near;
		this.drawLine(context, crystal.x, crystal.y, spot.x, spot.y);
	}

	// The pool of light where the ray lands.
	private drawSpot(context: CanvasRenderingContext2D, spot: { x: number; y: number }, unit: number) {
		const radius = STANDARD_CELL_SIZE * 0.5 * unit;
		const glow = context.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, radius);
		glow.addColorStop(0, "rgba(255, 255, 255, 0.85)");
		glow.addColorStop(0.4, "rgba(180, 240, 255, 0.5)");
		glow.addColorStop(1, "rgba(140, 220, 255, 0)");
		context.fillStyle = glow;
		context.beginPath();
		context.arc(spot.x, spot.y, radius, 0, Math.PI * 2);
		context.fill();
	}
}
