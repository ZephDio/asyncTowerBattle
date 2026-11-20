import { AnyBattleUnit } from "../../units/battle/battle-unit";

type QueuedUnit = { unit: AnyBattleUnit; source: unknown };

// Ticks between two spawns, by how many units wait in the queue: the longer the queue, the faster it empties.
const SPAWN_INTERVALS: Array<{ minQueued: number; ticks: number }> = [
	{ minQueued: 50, ticks: 1 },
	{ minQueued: 25, ticks: 2 },
	{ minQueued: 10, ticks: 3 },
	{ minQueued: 0, ticks: 5 },
];

export function spawnInterval(queued: number): number {
	const interval = SPAWN_INTERVALS.find(({ minQueued }) => queued >= minQueued);
	return interval?.ticks ?? 5;
}

// Holds the units an army adds so they join the battle one at a time instead of piling up on the same frame.
// A unit added to an idle queue joins on the queue's next tick.
export class SpawnQueue {
	private readonly queue: QueuedUnit[] = [];
	private ticksSinceSpawn = Number.POSITIVE_INFINITY;

	constructor(private readonly spawn: (unit: AnyBattleUnit, source: unknown) => void) {}

	get size() {
		return this.queue.length;
	}

	enqueue(unit: AnyBattleUnit, source: unknown) {
		this.queue.push({ unit, source });
	}

	tick() {
		this.ticksSinceSpawn += 1;
		if (this.queue.length === 0) return;
		if (this.ticksSinceSpawn < spawnInterval(this.queue.length)) return;
		this.spawnNext();
	}

	private spawnNext() {
		const next = this.queue.shift();
		if (!next) return;
		this.ticksSinceSpawn = 0;
		this.spawn(next.unit, next.source);
	}
}
