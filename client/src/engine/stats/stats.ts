import { implementsTrait, ImplementsTrait, Trait } from "@ddd-ts/traits";
import { Status } from "../../shared/traits/engine/status";
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
			castleDamage: number;
			projectileDamage: number;
			movementSpeed: number;
			attackSpeed: number;
			castSpeed: number;
			foodCost: number;
			range: number;
			onDeath: () => void;
		}) {
			super(props);
			this.stats = new Stats(
				props.maxHealth,
				props.castleDamage,
				props.projectileDamage,
				props.movementSpeed,
				props.castSpeed,
				props.attackSpeed,
				props.foodCost,
				props.range,
				props.onDeath,
			);
		}
	}
	return HaveStats;
});

// The stats that take flat bonuses and percent modifiers.
export type FlatStat =
	| "castleDamage"
	| "projectileDamage"
	| "movementSpeed"
	| "maxHealth"
	| "foodCost"
	| "castSpeed"
	| "range";

export class Stats {
	private _health: number;
	private _maxHealth: number;
	private _castleDamage: number;
	private _projectileDamage: number;
	private _movementSpeed: number;
	private _foodCost: number;
	private _castSpeed: number;
	private _attackSpeed: number;
	private _range: number;

	public basePercentStat = {
		castleDamage: 100,
		projectileDamage: 100,
		movementSpeed: 100,
		maxHealth: 100,
		foodCost: 100,
		castSpeed: 100,
		range: 100,
	};

	// Flat bonuses, added to the base value before the percent modifiers: (base + flat) * percent.
	public flatStat: Record<FlatStat, number> = {
		castleDamage: 0,
		projectileDamage: 0,
		movementSpeed: 0,
		maxHealth: 0,
		foodCost: 0,
		castSpeed: 0,
		range: 0,
	};

	public conditions: Map<string, ImplementsTrait<typeof Status>> = new Map();
	public boons: Map<string, ImplementsTrait<typeof Status>> = new Map();

	constructor(
		maxHealth: number,
		castleDamage: number,
		projectileDamage: number,
		speed: number,
		castSpeed: number,
		attackSpeed: number,
		foodCost: number,
		range: number,
		public onDeath: () => void,
	) {
		this._health = maxHealth;
		this._maxHealth = maxHealth;
		this._castleDamage = castleDamage;
		this._projectileDamage = projectileDamage;
		this._movementSpeed = speed;
		this._castSpeed = castSpeed;
		this._attackSpeed = attackSpeed;
		this._foodCost = foodCost;
		this._range = range;
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
				case "castle-damage":
					this.basePercentStat.castleDamage += amount * 4;
					break;
				case "projectile-damage":
					this.basePercentStat.projectileDamage += amount * 4;
					break;
			}
		});
	}
	// Values before any percent modifier, used to tell buffed stats from debuffed ones.
	get base() {
		return {
			maxHealth: this._maxHealth,
			castleDamage: this._castleDamage,
			projectileDamage: this._projectileDamage,
			movementSpeed: this._movementSpeed,
			castSpeed: this._castSpeed,
			foodCost: this._foodCost,
			range: this._range,
		};
	}

	get health() {
		return this._health;
	}

	// The base value plus the flat bonuses, before any percent modifier.
	private flatValue(stat: FlatStat) {
		return this.base[stat] + this.flatStat[stat];
	}

	private percentOf(stat: FlatStat) {
		return Math.max(0, this.basePercentStat[stat] / 100);
	}

	private boosted(stat: FlatStat) {
		return this.flatValue(stat) * this.percentOf(stat);
	}

	get maxHealth() {
		return this.boosted("maxHealth");
	}

	// Damage a unit deals to the enemy castle when it arrives.
	get castleDamage() {
		return this.boosted("castleDamage");
	}

	// Damage of the projectiles and area effects a piece fires. Independent from castleDamage.
	get projectileDamage() {
		return this.boosted("projectileDamage");
	}

	get movementSpeed() {
		return this.boosted("movementSpeed");
	}

	get castSpeed() {
		return this.boosted("castSpeed");
	}

	get attackSpeed() {
		return this._attackSpeed;
	}

	get foodCost() {
		return this.boosted("foodCost");
	}

	get range() {
		return this.boosted("range");
	}

	// A permanent flat bonus, applied before the percent modifiers. More max health comes with as much health.
	addFlat(stat: FlatStat, amount: number) {
		const before = this.maxHealth;
		this.flatStat[stat] += amount;
		this._health += this.maxHealth - before;
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
		if (!percent) return this.addFlat("maxHealth", amount);
		this.addPercentMaxHealth(amount);
	}

	// A percent of the base max health plus its flat bonuses, with as much health.
	private addPercentMaxHealth(amount: number) {
		this.basePercentStat.maxHealth += amount;
		this._health += amount * (this.flatValue("maxHealth") / 100);
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
		if (alreadyAffected) {
			alreadyAffected.stack(condition);
			return;
		}
		this.conditions.set(condition.key, condition);
	}

	addBoon(boon: ImplementsTrait<typeof Status>) {
		boon.setStats(this);
		const alreadyAffected = this.boons.get(boon.key);
		if (alreadyAffected) {
			alreadyAffected.stack(boon);
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
		this.boons.forEach((status) => {
			status.tick();
		});
	}
}
