import { Derive } from "@ddd-ts/traits";
import { Cast, Caster } from "../../../../shared/traits/engine/cast";
import { BattleArmyHooks } from "../../../army/battle/battle-army";
import { BattlePath } from "../../../path/battle/battle-path";
import { PathFinder } from "../../../battle/path-finder";
import { WhiteStag } from "../../recruit/implementation/white-stag";
import { HealWave } from "../../../area-effect/implementation/heal-wave";
import { FallenAntler } from "../../../area-effect/implementation/fallen-antler";
import { GridPosition } from "../../../../shared/position";
import { TBattleUnit } from "../battle-unit";
import { secondsToFrame } from "../../../../shared/seconds";
import { UnitResources } from "../../../../renderer/resources/unit.resources";

// Health healed per tick by the heal wave; a fallen antler heals 66% of it.
const HEAL_WAVE_HEAL = 0.13;
const FALLEN_ANTLER_HEAL = HEAL_WAVE_HEAL * 0.66;
const FALLEN_ANTLER_DURATION = secondsToFrame(2.5);
// Antlers fall at the stag's feet, below its center (y-up), so its body doesn't hide them.
const FALLEN_ANTLER_OFFSET = new GridPosition({ x: 0, y: -1.5 });

// Drops an antler, a healing aura where it falls, on reaching 50% health and the other one on death.
export class BattleWhiteStag extends Derive(TBattleUnit, Caster) {
	override idleSheet = UnitResources.whiteStagSheet;
	pathFinder: PathFinder;
	antlers = 2;

	constructor(
		recruit: WhiteStag,
		public position: GridPosition,
		public enemyPath: BattlePath,
		public hooks: BattleArmyHooks,
	) {
		super({
			casterRecruit: recruit,
			imageDrawable: recruit,
			maxHealth: recruit.stats.health,
			attack: recruit.stats.damage,
			movementSpeed: recruit.stats.speed,
			attackSpeed: recruit.stats.attackSpeed,
			castSpeed: recruit.stats.castSpeed,
			foodCost: recruit.stats.foodConsumption,
			range: recruit.stats.range,
			onDeath: () => {
				this.dropAntlers(0);
				this.hooks.removeUnit(this);
			},
			hitboxHolder: recruit,
			descriptor: recruit,
			tagHolder: recruit,
			rarityHolder: recruit,
		});
		this.pathFinder = new PathFinder(enemyPath.getNodes());
	}

	healWave() {
		this.hooks.addAreaEffect(new HealWave(35, this.position, HEAL_WAVE_HEAL, this.hooks), this);
		this.finishCast();
	}

	// Drops antlers until only `keep` are left. A stag killed from above 50% in one blow drops both.
	dropAntlers(keep: number) {
		while (this.antlers > keep) {
			this.antlers--;
			this.hooks.addAreaEffect(
				new FallenAntler(
					FALLEN_ANTLER_DURATION,
					this.position.add(FALLEN_ANTLER_OFFSET),
					FALLEN_ANTLER_HEAL,
					this.hooks,
				),
				this,
			);
		}
		if (this.antlers === 1) this.idleSheet = UnitResources.whiteStagOneAntlerSheet;
	}

	casts(): void {
		this.castInProgress = new Cast(this, this.healWave.bind(this));
	}

	override tick() {
		super.tick();
		if (this.antlers === 2 && this.stats.health <= this.stats.maxHealth / 2) this.dropAntlers(1);
		this.tickCast();
	}
}
