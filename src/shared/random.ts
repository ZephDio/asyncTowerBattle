export type Outcomes<T> = { value: T; share: number }[];
export class Random {
	static roll<T>(outComes: Outcomes<T>): T {
		const total = outComes.reduce((acc, cur) => acc + cur.share, 0);
		const roll = Math.random() * total;
		let sum = 0;
		for (const outcome of outComes) {
			sum += outcome.share;
			if (roll < sum) {
				return outcome.value;
			}
		}
		throw new Error("Rolling failed");
	}
}
