// Loaded first: the tower modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../../../match-maker/board-serializer";
import { ArmyFactory } from "../../../../army/army-fixtures";
import { Battlefield } from "../../../../battle/battlefield/battlefield";
import { LocalMatchMaker } from "../../../../match-maker/local-match-maker";
import { Faction } from "../../../../menu/main-menu";
import { Cell } from "../../../../../shared/position";
import { Forest } from "../../../../environment/forest";
import { Choupisson } from "../../../../units/recruit/implementation/choupisson";
import { ForestCabin } from "../../recruit/implementation/forest-cabin";
import type { BattleForestCabin } from "./battle-forest-cabin";

// The cabin at (1,3) shoots the path tile (0,3) on its left; its stars (1,4) and (1,2) hold the forests.
const fieldWith = (forests: number, enemies: number) => {
	const army = ArmyFactory.default(Faction.Elf);
	army.grid.setElement(new ForestCabin(new Cell({ x: 1, y: 3 })));
	for (const y of [4, 2].slice(0, forests)) army.grid.setElement(new Forest(new Cell({ x: 1, y })));
	const battlefield = new Battlefield(
		army,
		LocalMatchMaker.board(1).army,
		() => {},
		() => 0.5,
		{ clock: 0 },
	);
	const { alliedArmy, enemyArmy } = battlefield;
	const spot = battlefield.grid.cellToGrid(new Cell({ x: 0, y: 3 }));
	for (let index = 0; index < enemies; index++) {
		const unit = new Choupisson(new Cell({ x: 0, y: 3 })).toBattle(
			spot.clone(),
			enemyArmy.getEnemyPath(),
			enemyArmy.getHooks(),
		);
		enemyArmy.addUnit(unit, null);
	}
	battlefield.triggerBattleStartEffects();
	const cabin = alliedArmy.towers.find((tower) => tower.constructor.name === "BattleForestCabin") as BattleForestCabin;
	return { alliedArmy, enemyArmy, cabin };
};

describe("ForestCabin multi-shot in a battle", () => {
	it.each([
		[0, 3, 1],
		[1, 3, 2],
		[2, 3, 3],
		[2, 2, 2],
	])("with %s forests facing %s enemies it shoots %s different ones for one cast's food", (forests, enemies, bolts) => {
		const { alliedArmy, cabin } = fieldWith(forests, enemies);
		const before = alliedArmy.foodEconomy.food;
		cabin.onCastResolve();

		const targets = [...alliedArmy.projectiles.keys()].map(
			(projectile) => (projectile as unknown as { target: unknown }).target,
		);
		expect(targets).toHaveLength(bolts);
		expect(new Set(targets).size).toBe(bolts);
		expect(before - alliedArmy.foodEconomy.food).toBe(cabin.stats.foodCost);
	});
});
