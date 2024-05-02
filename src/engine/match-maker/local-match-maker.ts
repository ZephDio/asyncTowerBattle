import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { ArmyFixture } from "../army/army-fixtures";
import { BarrackRecruitBuilder } from "../barrack/recruit/barrack-fixtures";
import { CastleFactory } from "../castle/recruit/castle-recruit-fixtures";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { PathFactory } from "../path/army/path-fixtures";
import { TotemBuilder } from "../totem/recruit/totem-fixtures";
import { AnyTower } from "../tower/recruit/tower";
import { TowerBuilder } from "../tower/recruit/tower-fixtures";
import { DwarfBlueprint } from "../units/blueprint/implementation/dwarf-blueprint";
import { SoldierBlueprint } from "../units/blueprint/implementation/soldier-blueprint";
import { UnitRecruitFixture } from "../units/recruit/unit-fixtures";
import { MatchMaker } from "./match-maker";

export class LocalMatchMaker extends MatchMaker {
	getOpponent(round: number) {
		if (round > 6) {
			return EnemyArmyFixtures[6]();
		}
		const key = round as keyof typeof EnemyArmyFixtures;
		return EnemyArmyFixtures[key]();
	}
}

ArmyFixture;
const EnemyArmyFixtures = {
	1: () => {
		const grid = new ArmyGrid(7, 5, undefined, 6.3);
		const castle = CastleFactory.defaultDwarf;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 2 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
		];
		//const environment = [new Rock(new Cell({ x: 2, y: 2 })), new Rock(new Cell({ x: 3, y: 4 }))];
		const tiles = PathFactory.default;
		const barracks = [
			new BarrackRecruitBuilder()
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),
		];
		const totems = [new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField()];
		const unitInventory = new Inventory();
		[castle, ...towers, ...tiles, ...totems, ...barracks].map((e) => grid.setElement(e));
		return { army: new Army(grid, unitInventory, new DwarfBlueprint({})), randomSeed: 123456 };
	},
	2: () => {
		const grid = new ArmyGrid(8, 6);
		const castle = CastleFactory.round2Human;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 3 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.berseker)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),
		];
		const tiles = PathFactory.round2;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		[castle, ...towers, ...barracks, ...totems, ...tiles].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new SoldierBlueprint({})), randomSeed: 123456 };
	},
	3: () => {
		const grid = new ArmyGrid(8, 6);
		const castle = CastleFactory.round2Dwarf;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 3 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.berseker)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
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
		[castle, ...towers, ...barracks, ...totems, ...tiles].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
	},
	4: () => {
		const grid = new ArmyGrid(8, 6);
		const castle = CastleFactory.round2Human;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 3 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder()
				.celled(new Cell({ x: 2, y: 1 }))
				.buildBlue(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.berseker)
				.withCell(new Cell({ x: 3, y: 1 }))
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
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
		[castle, ...towers, ...barracks, ...totems, ...tiles].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new SoldierBlueprint({})), randomSeed: 123456 };
	},
	5: () => {
		const grid = new ArmyGrid(8, 6);
		const castle = CastleFactory.round2Dwarf;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 3 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder().celled(new Cell({ x: 6, y: 2 })).buildBlue(),
			new TowerBuilder()
				.celled(new Cell({ x: 2, y: 1 }))
				.buildZapping(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.berseker)
				.withCell(new Cell({ x: 3, y: 1 }))
				.withProductionSpeed(3.2)
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 6, y: 1 }))
				.withProductionSpeed(3.2)
				.buildBasic(),
		];
		const tiles = PathFactory.round2;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildCropsField(),

			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		[castle, ...towers, ...barracks, ...totems, ...tiles].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
	},
	6: () => {
		const grid = new ArmyGrid(8, 6);
		const castle = CastleFactory.round2Dwarf;
		const towers: AnyTower[] = [
			//TowerFixtures.centerTower,
			new TowerBuilder()
				.celled(new Cell({ x: 3, y: 3 }))
				.buildGreen(),
			new TowerBuilder().celled(new Cell({ x: 4, y: 2 })).buildFrost(),
			new TowerBuilder().celled(new Cell({ x: 6, y: 2 })).buildBlue(),
			new TowerBuilder()
				.celled(new Cell({ x: 2, y: 1 }))
				.buildZapping(),
			//new TotemBuilder()
		];
		const barracks = [
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.dragon)
				.withCell(new Cell({ x: 1, y: 1 }))
				.withProductionSpeed(3.2)
				.buildWave(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.berseker)
				.withCell(new Cell({ x: 3, y: 1 }))
				.withProductionSpeed(3.2)
				.buildVeterant(),

			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.priest)
				.withCell(new Cell({ x: 6, y: 1 }))
				.withProductionSpeed(3.2)
				.buildBasic(),
			new BarrackRecruitBuilder()
				.setUnit(UnitRecruitFixture.fox)
				.withCell(new Cell({ x: 6, y: 4 }))
				.withProductionSpeed(3.2)
				.buildBasic(),
		];
		const tiles = PathFactory.round2;
		const totems = [
			new TotemBuilder().celled(new Cell({ x: 1, y: 3 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 2 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 5 })).buildCropsField(),
			new TotemBuilder().celled(new Cell({ x: 1, y: 4 })).buildWindmill(),
			new TotemBuilder().celled(new Cell({ x: 2, y: 2 })).buildGobelinPortal(),
		];
		[castle, ...towers, ...barracks, ...totems, ...tiles].map((e) => grid.setElement(e));
		return { army: new Army(grid, new Inventory(), new DwarfBlueprint({})), randomSeed: 123456 };
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
