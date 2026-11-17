import { Trait } from "@ddd-ts/traits";
import { Stats } from "../../../engine/stats/stats";

export const Status = Trait((base) => {
	abstract class Status extends base {
		abstract key: string;
		abstract clock: number;
		abstract duration: number;

		abstract stats: Stats;
		abstract tick(): void;
		abstract onRemove(): void;
		abstract stack(status: Status): void;

		setStats(stats: Stats) {
			this.stats = stats;
		}
	}
	return Status;
});
