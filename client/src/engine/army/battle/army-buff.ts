export type ArmyBuffHooks = {
	addUnitBuff: ArmyBuff["addUnitBuff"];
	getUnitBuff: UnitArmyBuff["getBuff"];
	getUnitBuffs: ArmyBuff["getUnitArmyBuffs"];
	addTowerBuff: ArmyBuff["addTowerBuff"];
	getTowerBuff: TowerArmyBuff["getBuff"];
	getTowerBuffs: ArmyBuff["getTowerArmyBuffs"];
};
export type Buff = UnitBuff | TowerBuff;

export type UnitBuff = "movement-speed" | "cast-speed" | "vitality" | "castle-damage";
export type TowerBuff = "projectile-damage" | "cast-speed";

// The percent each stack of a buff adds to the stat (Stats.applyArmyBuffs). The unit and tower "cast-speed" buffs
// share this entry's value, but each applies only to its own side: tower buffs reach only towers, unit buffs only units.
export const ArmyBuffPercent: Record<Buff, number> = {
	"movement-speed": 2,
	"cast-speed": 2,
	vitality: 3,
	"castle-damage": 4,
	"projectile-damage": 4,
};

export class ArmyBuff {
	unitArmyBuff: UnitArmyBuff = new UnitArmyBuff();
	towerArmyBuff: TowerArmyBuff = new TowerArmyBuff();

	addUnitBuff(buff: UnitBuff, amount = 1) {
		this.unitArmyBuff.addBuff(buff, amount);
	}

	addTowerBuff(buff: TowerBuff, amount = 1) {
		this.towerArmyBuff.addBuff(buff, amount);
	}

	getUnitArmyBuffs() {
		return this.unitArmyBuff.getBuffs();
	}

	getTowerArmyBuffs() {
		return this.towerArmyBuff.getBuffs();
	}

	getHooks(): ArmyBuffHooks {
		return {
			addUnitBuff: this.addUnitBuff.bind(this),
			getUnitBuff: (ub: UnitBuff) => this.unitArmyBuff.getBuff(ub),
			getUnitBuffs: this.unitArmyBuff.getBuffs.bind(this),
			addTowerBuff: this.addTowerBuff.bind(this),
			getTowerBuff: (tb: TowerBuff) => this.towerArmyBuff.getBuff(tb),
			getTowerBuffs: this.towerArmyBuff.getBuffs.bind(this),
		};
	}
}

export class UnitArmyBuff {
	buffs: Map<UnitBuff, number> = new Map();

	addBuff(buff: UnitBuff, amount = 1) {
		this.buffs.set(buff, (this.buffs.get(buff) ?? 0) + amount);
	}

	getBuffs(): [UnitBuff, number][] {
		return [...this.buffs.entries()];
	}
	getBuff(buff: UnitBuff) {
		return this.buffs.get(buff) ?? 0;
	}
}

export class TowerArmyBuff {
	buffs: Map<TowerBuff, number> = new Map();

	addBuff(buff: TowerBuff, amount = 1) {
		this.buffs.set(buff, (this.buffs.get(buff) ?? 0) + amount);
	}

	getBuffs(): [TowerBuff, number][] {
		return [...this.buffs.entries()];
	}
	getBuff(buff: TowerBuff) {
		return this.buffs.get(buff) ?? 0;
	}
}
