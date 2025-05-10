import { Derive, ImplementsTrait, Subtrait, Trait } from "@ddd-ts/traits";

export class BaseStats {
	private _health: number;
	private _speed: number;
	private _castSpeed: number;
	private _damage: number;
	private _foodConsumptionOnCast: number;
	private _foodConsumption: number;
	private _summonTime: number;
	private _attackSpeed: number;
	private _range: number;

	constructor(
		health: number,
		speed: number,
		attackSpeed: number,
		castSpeed: number,
		damage: number,
		foodConsumptionOnCast: number,
		foodConsumption: number,
		summonTime: number,
		range: number,
	) {
		this._health = health;
		this._speed = speed;
		this._attackSpeed = attackSpeed;
		this._castSpeed = castSpeed;
		this._damage = damage;
		this._foodConsumptionOnCast = foodConsumptionOnCast;
		this._foodConsumption = foodConsumption;
		this._summonTime = summonTime;
		this._range = range;
	}

	get health() {
		return this._health;
	}

	get speed() {
		return this._speed;
	}

	get attackSpeed() {
		return this._attackSpeed;
	}

	get castSpeed() {
		return this._castSpeed;
	}

	get damage() {
		return this._damage;
	}

	get foodConsumptionOnCast() {
		return this._foodConsumptionOnCast;
	}

	get foodConsumption() {
		return this._foodConsumption;
	}

	get summonTime() {
		return this._summonTime;
	}

	get range() {
		return this._range;
	}

	hasDamage() {
		return !Number.isNaN(this.damage);
	}
}

export type BaseStatsProps = {
	health: number;
	speed: number;
	attackSpeed: number;
	castSpeed: number;
	damage: number;
	foodConsumptionOnCast: number;
	foodConsumption: number;
	summonTime: number;
	range: number;
};

export const TBaseStats = (baseStat: BaseStatsProps) =>
	Trait((base) => {
		abstract class BaseStatsTrait extends base {
			stats: BaseStats = new BaseStats(
				baseStat.health,
				baseStat.speed,
				baseStat.attackSpeed,
				baseStat.castSpeed,
				baseStat.damage,
				baseStat.foodConsumptionOnCast,
				baseStat.foodConsumption,
				baseStat.summonTime,
				baseStat.range,
			);
		}
		return BaseStatsTrait;
	});

export const HTBaseStats = Subtrait([TBaseStats({} as BaseStatsProps)], (base, param) => {
	return class BaseStatsTrait extends base {
		declare stats: BaseStats;
		constructor(props: { statsHolder: ImplementsTrait<ReturnType<typeof TBaseStats>> } & typeof param) {
			super(props);
			this.stats = props.statsHolder.stats;
		}
	};
});
