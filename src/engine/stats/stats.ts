import { implementsTrait, ImplementsTrait, Trait } from "@ddd-ts/traits";
import { StackableStatus, Status } from "../../shared/traits/engine/status";
import { Buff } from "../army/battle/army-buff";
import { TDrawable } from "../../shared/traits/render/drawable";

export const HaveStats = Trait((base) => {
	abstract class HaveStats extends base {
		stats: Stats;
		addCondition(condition: ImplementsTrait<typeof Status>) {
			this.stats.addCondition(condition);
		}

		addBoon(boon: ImplementsTrait<typeof Status>) {
			this.stats.addBoon(boon);
		}

		initArmyBuffs(buffs: [Buff, number][]) {
			this.stats.applyArmyBuffs(buffs);
		}

		applyBuff(buff: Buff, amount: number) {
			this.stats.applyArmyBuffs([[buff, amount]]);
		}

		removeCondition(condition: ImplementsTrait<typeof Status>) {
			this.stats.removeCondition(condition);
		}

		removeBoon(boon: ImplementsTrait<typeof Status>) {
			this.stats.removeBoon(boon);
		}

		takeHit(hitDamage: number) {
			const stoneShield = this.stats.getStoneShieldBoon();
			if (stoneShield) {
				this.stats.removeBoon(stoneShield);
				return;
			}
			this.stats.takeDamage(hitDamage);
		}

		heal(amount: number) {
			this.stats.heal(amount);
		}

		die() {
			this.stats.die();
		}

		addFurry(amount: number) {
			this.stats.addMaxHealth(amount, true);
			this.stats.basePercentStat.movementSpeed += amount;
		}

		getRenderableStatus() {
			return this.stats.getRenderableStatus();
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

	public conditions: Map<string, ImplementsTrait<typeof Status>> = new Map();
	public boons: Map<string, ImplementsTrait<typeof Status>> = new Map();

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

	getStoneShieldBoon() {
		return this.boons.get("stoneShield");
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
		return !this.conditions.has("stunned");
	}

	removeCondition(condition: ImplementsTrait<typeof Status>) {
		condition.onRemove();
		this.conditions.delete(condition.key);
	}

	removeBoon(boon: ImplementsTrait<typeof Status>) {
		boon.onRemove();
		this.boons.delete(boon.key);
	}

	addCondition(condition: ImplementsTrait<typeof Status>) {
		condition.setStats(this);
		const alreadyAffected = this.conditions.get(condition.key);
		const stackable = implementsTrait(condition, StackableStatus);
		if (!stackable && alreadyAffected) return;
		if (stackable && alreadyAffected) {
			if (implementsTrait(alreadyAffected, StackableStatus)) {
				alreadyAffected.stack(condition);
			}
			return;
		}
		this.conditions.set(condition.key, condition);
	}

	addBoon(boon: ImplementsTrait<typeof Status>) {
		boon.setStats(this);
		const alreadyAffected = this.boons.get(boon.key);
		const stackable = implementsTrait(boon, StackableStatus);
		if (!stackable && alreadyAffected) return;
		if (stackable && alreadyAffected) {
			if (implementsTrait(alreadyAffected, StackableStatus)) {
				alreadyAffected.stack(boon);
			}
			return;
		}
		this.boons.set(boon.key, boon);
	}

	getRenderableStatus() {
		return [...this.conditions.values(), ...this.boons.values()].filter((status) => {
			return implementsTrait(status, TDrawable);
		});
	}

	tick() {
		this.conditions.forEach((status) => {
			status.tick();
		});
	}
}
