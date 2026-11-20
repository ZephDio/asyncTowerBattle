import type { AnyBattleUnit } from "../../units/battle/battle-unit";
import { SpawnQueue, spawnInterval } from "./spawn-queue";

const unit = (id: number) => ({ id }) as unknown as AnyBattleUnit;

const recordingQueue = () => {
	const spawnedAt: number[] = [];
	let clock = 0;
	const queue = new SpawnQueue(() => spawnedAt.push(clock));
	const runTicks = (ticks: number) => {
		for (let i = 0; i < ticks; i++) {
			queue.tick();
			clock += 1;
		}
	};
	return { queue, spawnedAt, runTicks };
};

describe("spawnInterval", () => {
	it.each([
		[1, 5],
		[9, 5],
		[10, 3],
		[24, 3],
		[25, 2],
		[49, 2],
		[50, 1],
		[200, 1],
	])("waits %i queued units → every %i ticks", (queued, ticks) => {
		expect(spawnInterval(queued)).toBe(ticks);
	});
});

describe("SpawnQueue", () => {
	it("spawns a unit added to an idle queue on the next tick", () => {
		const { queue, spawnedAt, runTicks } = recordingQueue();
		queue.enqueue(unit(1), undefined);

		runTicks(1);

		expect(spawnedAt).toEqual([0]);
	});

	it("spawns two units added on the same frame 5 ticks apart", () => {
		const { queue, spawnedAt, runTicks } = recordingQueue();
		queue.enqueue(unit(1), undefined);
		queue.enqueue(unit(2), undefined);

		runTicks(10);

		expect(spawnedAt).toEqual([0, 5]);
	});

	it("keeps the order units were added in, with their source", () => {
		const spawned: Array<[AnyBattleUnit, unknown]> = [];
		const queue = new SpawnQueue((spawning, source) => spawned.push([spawning, source]));
		const first = unit(1);
		const second = unit(2);
		queue.enqueue(first, "barrack");
		queue.enqueue(second, "castle");

		for (let i = 0; i < 6; i++) queue.tick();

		expect(spawned).toEqual([
			[first, "barrack"],
			[second, "castle"],
		]);
	});

	it("speeds up while the queue is long", () => {
		const { queue, spawnedAt, runTicks } = recordingQueue();
		for (let i = 0; i < 11; i++) queue.enqueue(unit(i), undefined);

		runTicks(20);

		// 11 then 10 queued: 3 ticks apart; from 9 queued: 5 ticks apart.
		expect(spawnedAt.slice(0, 4)).toEqual([0, 3, 8, 13]);
	});

	it("does not spawn a late unit before the interval since the last spawn", () => {
		const { queue, spawnedAt, runTicks } = recordingQueue();
		queue.enqueue(unit(1), undefined);
		runTicks(2);
		queue.enqueue(unit(2), undefined);

		runTicks(5);

		expect(spawnedAt).toEqual([0, 5]);
	});
});
