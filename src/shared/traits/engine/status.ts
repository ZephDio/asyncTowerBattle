import { Trait } from "@ddd-ts/traits";
import { Stats } from "../../../engine/stats/stats";

export const Status = Trait((base) => {
	abstract class Status extends base {
		stackable: boolean = true;
		abstract clock: number;
		abstract key: string;
		abstract duration: number;

		abstract stats: Stats;

		abstract tick(): void;

		setStats(stats: Stats) {
			this.stats = stats;
		}
	}
	return Status;
});
