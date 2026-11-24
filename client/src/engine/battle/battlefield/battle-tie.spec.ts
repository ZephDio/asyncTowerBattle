// Loaded first: the piece modules run into the engine's grid <-> render traits import cycle otherwise.
import "../../match-maker/board-serializer";
import { ArmyFactory } from "../../army/army-fixtures";
import { LocalMatchMaker } from "../../match-maker/local-match-maker";
import { Faction } from "../../menu/main-menu";
import { Battlefield } from "./battlefield";

const field = () => {
	const verdicts: string[] = [];
	const battlefield = new Battlefield(
		ArmyFactory.default(Faction.Elf),
		LocalMatchMaker.board(1).army,
		(verdict) => verdicts.push(verdict),
		() => 0.5,
		{ clock: 0 },
	);
	return { battlefield, verdicts };
};

describe("the end of a battle", () => {
	it("is a victory when both castles fall in the same tick", () => {
		const { battlefield, verdicts } = field();
		const { alliedArmy, enemyArmy } = battlefield;

		alliedArmy.castle.stats.takeDamage(alliedArmy.castle.stats.health);
		enemyArmy.castle.stats.takeDamage(enemyArmy.castle.stats.health);
		battlefield.tick();

		expect(verdicts).toEqual(["Victory"]);
	});

	it("is a defeat when only the allied castle falls", () => {
		const { battlefield, verdicts } = field();
		const { alliedArmy } = battlefield;

		alliedArmy.castle.stats.takeDamage(alliedArmy.castle.stats.health);
		battlefield.tick();

		expect(verdicts).toEqual(["Defeat"]);
	});
});
