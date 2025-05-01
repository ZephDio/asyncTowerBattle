import { Subtrait, Trait } from "@ddd-ts/traits";
import { Stats } from "../../../engine/stats/stats";

export const Status = Trait((base) => {
	abstract class Status extends base {
		abstract key: string;
		abstract clock: number;
		abstract duration: number;

		abstract stats: Stats;
		abstract tick(): void;
		abstract onRemove(): void;

		setStats(stats: Stats) {
			this.stats = stats;
		}
	}
	return Status;
});

export const StackableStatus = Subtrait([Status], (base, _props) => {
	abstract class StackableStatus extends base {
		abstract stack(status: StackableStatus): void;
	}
	return StackableStatus;
});
