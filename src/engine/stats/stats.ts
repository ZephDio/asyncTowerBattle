import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Status } from "../../shared/traits/status";

export const HaveStats = Trait((base) => {
	abstract class HaveStats extends base {
		stats: Stats;
		addStatus(status: ImplementsTrait<typeof Status>) {
			this.stats.addStatus(status);
		}

		constructor(props: {
			maxHealth: number;
			attack: number;
			movementSpeed: number;
			castSpeed: number;
			onDeath: () => void;
		}) {
			super(props);
			this.stats = new Stats(props.maxHealth, props.attack, props.movementSpeed, props.castSpeed, props.onDeath);
		}
	}
	return HaveStats;
});

export class Stats {
	private _health: number;
	private _maxHealth: number;
	private _attack: number;
	private _movementSpeed: number;

	private _castSpeed: number;

	public basePercentStat: {
		attack: number;
		movementSpeed: number;
	} = {
		attack: 100,
		movementSpeed: 100,
	};

	public status: Map<string, ImplementsTrait<typeof Status>> = new Map();

	constructor(
		maxHealth: number,
		attack: number,
		speed: number,
		castSpeed: number,
		public onDeath: () => void,
	) {
		this._health = maxHealth;
		this._maxHealth = maxHealth;
		this._attack = attack;
		this._movementSpeed = speed;
		this._castSpeed = castSpeed;
	}

	get health() {
		return this._health;
	}

	get maxHealth() {
		return this._maxHealth;
	}

	get attack() {
		return this._attack * (this.basePercentStat.attack / 100);
	}

	get movementSpeed() {
		return this._movementSpeed * (this.basePercentStat.movementSpeed / 100);
	}

	get castSpeed() {
		return this._castSpeed;
	}

	takeDamage(damage: number) {
		this._health -= damage;
		if (this._health <= 0) {
			this.onDeath();
		}
	}
	removeStatus(status: ImplementsTrait<typeof Status>) {
		this.status.delete(status.key);
	}

	addStatus(status: ImplementsTrait<typeof Status>) {
		const alreadyAffected = this.status.get(status.key);
		if (alreadyAffected) {
			if (alreadyAffected.duration < status.duration) {
				alreadyAffected.duration = status.duration;
			}
			alreadyAffected.clock = 0;
			return;
		}
		this.status.set(status.key, status);
		status.setStats(this);
	}

	tick() {
		this.status.forEach((status) => {
			status.tick();
		});
	}
}
