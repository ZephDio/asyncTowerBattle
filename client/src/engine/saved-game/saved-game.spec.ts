import { Cell } from "../../shared/position";
import "../match-maker/board-serializer";
// After the serializer: loaded first, these run into the engine's grid <-> render traits import cycle.
import { ArmyFactory } from "../army/army-fixtures";
import { LocalMatchMaker } from "../match-maker/local-match-maker";
import { Faction } from "../menu/main-menu";
import { SlowingTrap } from "../trap/recruit/implementation/slowing-trap";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { BasicBarrack } from "../constructs/barrack/recruit/implementation/basic-barrack";
import { Fox } from "../units/recruit/implementation/fox";
import { Dragon } from "../units/recruit/implementation/dragon";
import { FrostTower } from "../constructs/tower/recruit/implementation/frost-tower";
import { BlacksmithTower } from "../constructs/tower/recruit/implementation/blacksmith-tower";
import { Mine } from "../constructs/totem/recruit/implementation/mine";
import { restoreGame, serializeGame } from "./saved-game";

const origin = () => new Cell({ x: 0, y: 0 });

const armyWithReserve = () => {
	const army = ArmyFactory.default(Faction.Elf);
	const barrack = new BasicBarrack(origin());
	barrack.setUnit(new Fox(origin()));
	[
		new FrostTower(origin()),
		new Mine(origin()),
		barrack,
		new Dragon(origin()),
		new SlowingTrap(origin()),
		new BasicPathTile(origin()),
	].forEach((recruit) => army.pushToInventory(recruit));
	army.goldEconomy.golds.amount = 37;
	return army;
};

const throughJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe("saved game", () => {
	it("rebuilds the army, its reserve and its gold from the JSON it was saved as", () => {
		const army = armyWithReserve();
		const saved = throughJson(
			serializeGame({ phase: "shop", army, runSeed: 1234, round: 1, life: 4, performance: { wins: 2, losses: 1 } }),
		);

		const restored = restoreGame(saved);

		expect(restored).toMatchObject({
			faction: Faction.Elf,
			runSeed: 1234,
			round: 1,
			life: 4,
			phase: "shop",
			opponent: null,
		});
		expect(restored.performance).toEqual({ wins: 2, losses: 1 });
		expect(serializeGame({ ...restored, opponent: undefined })).toEqual(saved);
		expect(saved.inventory.map((item) => item.kind)).toEqual(["tower", "totem", "barrack", "unit", "trap", "path"]);
		expect(restored.army.goldEconomy.golds.amount).toBe(37);
	});

	it("keeps a piece that spans several cells once, where the reserve placed it", () => {
		const army = ArmyFactory.default(Faction.Elf);
		const tower = new BlacksmithTower(origin());
		army.pushToInventory(tower);
		army.pushToInventory(new Fox(origin()));
		const placed = tower.cell.clone();

		const saved = throughJson(
			serializeGame({ phase: "shop", army, runSeed: 1, round: 1, life: 5, performance: { wins: 0, losses: 0 } }),
		);
		const restored = restoreGame(saved);

		expect(tower.gridShape.getVectorialCells().length).toBeGreaterThan(1);
		expect(saved.inventory).toHaveLength(2);
		const restoredTower = restored.army.inventory.getRecruits().find((recruit) => recruit instanceof BlacksmithTower);
		expect(restoredTower?.cell).toEqual(placed);
		expect(restored.army.inventory.getRecruits()).toHaveLength(3);
	});

	it("keeps the opponent of a battle with its seed and its player", () => {
		const army = ArmyFactory.default(Faction.Dwarf);
		const opponent = { ...LocalMatchMaker.board(1), playerName: "Bob" };

		const saved = throughJson(
			serializeGame({
				phase: "battle",
				army,
				runSeed: 1234,
				round: 1,
				life: 5,
				performance: { wins: 0, losses: 0 },
				opponent,
			}),
		);
		const restored = restoreGame(saved);

		expect(restored.opponent?.playerName).toBe("Bob");
		expect(restored.opponent?.randomSeed).toBe(opponent.randomSeed);
		expect(restored.opponent?.army.path.length).toBe(opponent.army.path.length);
	});
});
