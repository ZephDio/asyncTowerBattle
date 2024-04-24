import { ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Status } from "../../shared/traits/engine/status";
import { Buff } from "../army/battle/army-buff";

export const HaveStats = Trait((base) => {
	abstract class HaveStats extends base {
		stats: Stats;
		addStatus(status: ImplementsTrait<typeof Status>) {
			this.stats.addStatus(status);
		}

		initArmyBuffs(buffs: [Buff, number][]) {
			this.stats.applyArmyBuffs(buffs);
		}

		applyBuff(buff: Buff, amount: number) {
			this.stats.applyArmyBuffs([[buff, amount]]);
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

		die() {
			this.stats.die();
		}

		constructor(props: {
			maxHealth: number;
			attack: number;
			movementSpeed: number;
			attackSpeed: number;
			castSpeed: number;
			foodCost: number;
			onDeath: () => void;
		}) {
			super(props);
			this.stats = new Stats(
				props.maxHealth,
				props.attack,
				props.movementSpeed,
				props.castSpeed,
				props.attackSpeed,
				props.foodCost,
				props.onDeath,
			);
		}
	}
	return HaveStats;
});

export class Stats {
	private _health: number;
	private _maxHealth: number;
	private _attack: number;
	private _movementSpeed: number;
	private _foodCost: number;
	private _castSpeed: number;
	private _attackSpeed: number;

	public basePercentStat = {
		attack: 100,
		movementSpeed: 100,
		maxHealth: 100,
		foodCost: 100,
		castSpeed: 100,
	};

	public status: Map<string, ImplementsTrait<typeof Status>> = new Map();

	constructor(
		maxHealth: number,
		attack: number,
		speed: number,
		castSpeed: number,
		attackSpeed: number,
		foodCost: number,
		public onDeath: () => void,
	) {
		this._health = maxHealth;
		this._maxHealth = maxHealth;
		this._attack = attack;
		this._movementSpeed = speed;
		this._castSpeed = castSpeed;
		this._attackSpeed = attackSpeed;
		this._foodCost = foodCost;
	}

	applyArmyBuffs(buffs: [Buff, number][]) {
		buffs.forEach(([buff, amount]) => {
			switch (buff) {
				case "movement-speed":
					this.basePercentStat.movementSpeed += amount * 2;
					break;
				case "cast-speed":
					this.basePercentStat.castSpeed += amount * 2;
					break;
				case "vitality":
					this.addMaxHealth(3 * amount, true);
					break;
				case "attack":
					this.basePercentStat.attack += amount * 4;
					break;
			}
		});
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
		return this._castSpeed * Math.max(0, this.basePercentStat.castSpeed / 100);
	}

	get attackSpeed() {
		return this._attackSpeed;
	}

	get foodCost() {
		return this._foodCost * Math.max(0, this.basePercentStat.foodCost / 100);
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

	heal(amount: number) {
		this._health = Math.min(this.maxHealth, this._health + amount);
	}

	die() {
		this._health = 0;
		this.onDeath();
	}

	canMove() {
		return !this.status.has("stunned");
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
