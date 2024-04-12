import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Status } from "../../shared/traits/engine/status";

export const HaveStats = Trait((base) => {
	abstract class HaveStats extends base {
		stats: Stats;
		addStatus(status: ImplementsTrait<typeof Status>) {
			this.stats.addStatus(status);
		}

		removeStatus(status: ImplementsTrait<typeof Status>) {
			this.stats.removeStatus(status);
		}

		takeDamage(damage: number) {
			this.stats.takeDamage(damage);
		}

		heal(amount: number) {
			this.stats.heal(amount);
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

	public basePercentStat = {
		attack: 100,
		movementSpeed: 100,
		maxHealth: 100,
	};

	public status: Map<string, ImplementsTrait<typeof Status>> = new Map();
	attackSpeed: number;

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
		return this._maxHealth * Math.max(0, this.basePercentStat.maxHealth / 100);
	}

	get attack() {
		return this._attack * Math.max(0, this.basePercentStat.attack / 100);
	}

	get movementSpeed() {
		return this._movementSpeed * Math.max(0, this.basePercentStat.movementSpeed / 100);
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

	addMaxHealth(amount: number, percent: boolean = false) {
		const rawGain = percent ? amount * (this._maxHealth / 100) : amount;
		if (percent) {
			this.basePercentStat.maxHealth += amount;
			this._health += rawGain;
			return;
		}
		this.basePercentStat.maxHealth += rawGain;
		this._health += rawGain;
	}

	// modifyBaseMovementSpeed(amount: number) {
	// 	this._movementSpeed += amount;
	// }

	// modifyBaseAttack(amount: number) {
	// 	this._attack += amount;
	// }

	heal(amount: number) {
		this._health = Math.min(this.maxHealth, this._health + amount);
	}

	removeStatus(status: ImplementsTrait<typeof Status>) {
		this.status.delete(status.key);
	}

	addStatus(status: ImplementsTrait<typeof Status>) {
		const alreadyAffected = this.status.get(status.key);
		if (alreadyAffected) {
			if (!status.stackable) return;
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
