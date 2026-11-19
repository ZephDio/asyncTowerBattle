import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { ArmyFixture } from "../army/army-fixtures";
import { BarrackRecruitBuilder } from "../constructs/barrack/recruit/barrack-fixtures";
import { CastleFactory } from "../castle/recruit/castle-recruit-fixtures";
import { Forest } from "../environment/forest";
import { Rock } from "../environment/rock";
import { ArmyGrid } from "../grid/grid";
import { GRID_GROWTH_CYCLE, armyGridSize } from "../grid/grid-sizes";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFactory } from "../path/army/path-fixtures";
import { TotemBuilder } from "../constructs/totem/recruit/totem-fixtures";
import { AnyTower } from "../constructs/tower/recruit/tower";
import { TowerBuilder } from "../constructs/tower/recruit/tower-fixtures";
import { DwarfBlueprint } from "../units/blueprint/implementation/dwarf-blueprint";
import { ElfBlueprint } from "../units/blueprint/implementation/elf-blueprint";
import { UnitRecruitFixture } from "../units/recruit/unit-fixtures";
import { BOT_NAME, MatchMaker } from "./match-maker";

export class LocalMatchMaker extends MatchMaker {
	async getOpponent(round: number) {
		return { ...LocalMatchMaker.board(round), playerName: BOT_NAME };
	}

	static board(round: number) {
		const lastRound = GRID_GROWTH_CYCLE.length as keyof typeof EnemyArmyFixtures;
		if (round > lastRound) {
			return EnemyArmyFixtures[lastRound]();
		}
		const key = round as keyof typeof EnemyArmyFixtures;
		return EnemyArmyFixtures[key]();
	}
}

const rocks = (...cells: [number, number][]) => cells.map(([x, y]) => new Rock(new Cell({ x, y })));
const forests = (...cells: [number, number][]) => cells.map(([x, y]) => new Forest(new Cell({ x, y })));

// Each board holds the rocks and trees an allied grid has gathered by the same round, see GRID_GROWTH_CYCLE.
ArmyFixture;
const EnemyArmyFixtures = {
	1: () => {
		const size = armyGridSize(1);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.dwarf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 2 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			// Covers (3, 4), (4, 4) and (4, 3), its star on the rock at (2, 4)
			new TowerBuilder().celled(new Cell({ x: 4, y: 4 })).buildDrill(),
		];
		const environment = [...forests([5, 4], [6, 4], [6, 3]), ...rocks([2, 4], [4, 5])];
		const tiles = PathFactory.default;
		const barracks = [
			new BarrackRecruitBuilder().withCell(new Cell({ x: 1, y: 1 })).buildWave(),
			new BarrackRecruitBuilder().withCell(new Cell({ x: 3, y: 1 })).buildVeterant(),
		];
		const totems = [new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField()];
		const unitInventory = new Inventory();
		[castle, ...towers, ...tiles, ...totems, ...barracks, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, unitInventory, new DwarfBlueprint({})), randomSeed: 123456 };
	},
	2: () => {
		const size = armyGridSize(2);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.elf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder().withCell(new Cell({ x: 3, y: 1 })).buildVeterant(),
		];
		const tiles = PathFactory.round2;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		const environment = [...forests([6, 0], [7, 0], [7, 1]), ...rocks([2, 5], [5, 5])];
		[castle, ...towers, ...barracks, ...totems, ...tiles, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new ElfBlueprint({})), randomSeed: 123456 };
	},
	3: () => {
		const size = armyGridSize(3);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.dwarf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.whiteStag)
				.withCell(new Cell({ x: 6, y: 1 }))
				.buildBasic(),
		];
		const tiles = PathFactory.round2;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildCropsField(),

			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		const environment = [...forests([7, 0], [8, 0], [8, 1]), ...rocks([2, 5], [5, 5], [8, 3])];
		[castle, ...towers, ...barracks, ...totems, ...tiles, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
	},
	4: () => {
		const size = armyGridSize(4);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.elf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder().celled(new Cell({ x: 2, y: 1 })).buildBlue(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.whiteStag)
				.withCell(new Cell({ x: 6, y: 1 }))
				.buildBasic(),
		];
		const tiles = PathFactory.round4;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildCropsField(),

			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		const environment = [...forests([8, 0], [9, 0], [9, 1], [10, 3], [10, 4]), ...rocks([2, 5], [5, 5], [8, 2])];
		[castle, ...towers, ...barracks, ...totems, ...tiles, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new ElfBlueprint({})), randomSeed: 123456 };
	},
	5: () => {
		const size = armyGridSize(5);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.dwarf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder().celled(new Cell({ x: 6, y: 2 })).buildBlue(),
			new TowerBuilder().celled(new Cell({ x: 2, y: 1 })).buildZapping(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.whiteStag)
				.withCell(new Cell({ x: 6, y: 1 }))
				.buildBasic(),
		];
		const tiles = PathFactory.round4;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildCropsField(),

			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		const environment = [
			...forests([8, 0], [9, 0], [9, 1], [10, 3], [10, 4]),
			...rocks([2, 5], [5, 5], [8, 2], [4, 4]),
		];
		[castle, ...towers, ...barracks, ...totems, ...tiles, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
	},
	6: () => {
		const size = armyGridSize(6);
		const grid = ArmyGrid.sized(size);
		const castle = CastleFactory.dwarf(size);
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder().celled(new Cell({ x: 3, y: 3 })).buildWindmillTurret(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder().celled(new Cell({ x: 6, y: 2 })).buildBlue(),
			new TowerBuilder().celled(new Cell({ x: 2, y: 1 })).buildZapping(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.choupisson)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.whiteStag)
				.withCell(new Cell({ x: 6, y: 1 }))
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.fox)
				.withCell(new Cell({ x: 6, y: 4 }))
				.buildBasic(),
		];
		const tiles = PathFactory.round4;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 5 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildWindmill(),
			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		const environment = [
			...forests([8, 0], [9, 0], [9, 1], [10, 3], [10, 4]),
			...rocks([2, 5], [5, 5], [8, 2], [4, 4]),
		];
		[castle, ...towers, ...barracks, ...totems, ...tiles, ...environment].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
	},
	// The round 6 board with one more rock and a witch house.
	7: () => {
		const { army, randomSeed } = EnemyArmyFixtures[6]();
		[...rocks([9, 5]), new TowerBuilder().celled(new Cell({ x: 8, y: 4 })).buildYellow()].map((e) =>
			army.grid.setElement(e),
		);
		return { army, randomSeed };
	},
	// The round 7 board grown like an allied grid: a new top row, the path stretched to the new door, and new trees.
	8: () => {
		const { army, randomSeed } = EnemyArmyFixtures[7]();
		army.grid.grow(armyGridSize(8));
		forests([11, 2], [12, 2]).map((e) => army.grid.setElement(e));
		return { army, randomSeed };
	},
};

// return new ArmyPath([
// 	new BasicPathTile(new Cell({ x: 0, y: 5 })),
// 	new BasicPathTile(new Cell({ x: 0, y: 4 })),
// 	new SlowingPathTile(new Cell({ x: 0, y: 3 })),
// 	new SlowingPathTile(new Cell({ x: 1, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 2, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 2, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 3, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 4, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 4, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 5, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 6, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 7, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 8, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 9, y: 1 })),
// 	new BasicPathTile(new Cell({ x: 9, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 10, y: 2 })),
// 	new BasicPathTile(new Cell({ x: 10, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 11, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 12, y: 3 })),
// 	new BasicPathTile(new Cell({ x: 12, y: 4 })),
// ]);
