import { Cell } from "../../shared/position";
import { Army } from "../army/army";
import { DwarfCastleBlueprint } from "../castle/blueprint/dwarf-castle-blueprint";
import { ElfCastleBlueprint } from "../castle/blueprint/elf-castle-blueprint";
import { AnyCastle } from "../castle/recruit/castle-recruit";
import { DwarfCastle } from "../castle/recruit/implem/dwarf-castle";
import { ElfCastle } from "../castle/recruit/implem/elf-castle";
import { AnyBarrack } from "../constructs/barrack/recruit/barrack";
import { BasicBarrack } from "../constructs/barrack/recruit/implementation/basic-barrack";
import { VeterantBarrack } from "../constructs/barrack/recruit/implementation/veterant-barrack";
import { WaveBarrack } from "../constructs/barrack/recruit/implementation/wave-barrack";
import { AnvilTotem } from "../constructs/totem/recruit/implementation/anvil";
import { Bakery } from "../constructs/totem/recruit/implementation/backery";
import { Brewery } from "../constructs/totem/recruit/implementation/brewery";
import { CropsField } from "../constructs/totem/recruit/implementation/crops-field";
import { GobelinPortal } from "../constructs/totem/recruit/implementation/gobelin-portal";
import { Mine } from "../constructs/totem/recruit/implementation/mine";
import { RedObelisk } from "../constructs/totem/recruit/implementation/obelisk";
import { PowderMagazine } from "../constructs/totem/recruit/implementation/powder-magazine";
import { Windmill } from "../constructs/totem/recruit/implementation/windmill";
import { AnyTotem } from "../constructs/totem/recruit/totem";
import { BlueTower } from "../constructs/tower/recruit/implementation/blue-tower";
import { DrillTower } from "../constructs/tower/recruit/implementation/drill-tower";
import { FrostTower } from "../constructs/tower/recruit/implementation/frost-tower";
import { GreenTower } from "../constructs/tower/recruit/implementation/green-tower";
import { WitchHouse } from "../constructs/tower/recruit/implementation/witch-house";
import { ZappingTower } from "../constructs/tower/recruit/implementation/zapping-tower";
import { AnyTower } from "../constructs/tower/recruit/tower";
import { Forest } from "../environment/forest";
import { Rock } from "../environment/rock";
import { ArmyGrid } from "../grid/grid";
import { Inventory } from "../grid/inventory/unit-inventory";
import { BasicPathTile } from "../tile/recruit/implementation/basic-tile";
import { SlowingTrap } from "../trap/recruit/implementation/slowing-trap";
import { StunTrap } from "../trap/recruit/implementation/stun-trap";
import { AnyTrap } from "../trap/recruit/trap";
import { DwarfBlueprint } from "../units/blueprint/implementation/dwarf-blueprint";
import { ElfBlueprint } from "../units/blueprint/implementation/elf-blueprint";
import { Brewmaster } from "../units/recruit/implementation/brewmaster";
import { Choupisson } from "../units/recruit/implementation/choupisson";
import { Dragon } from "../units/recruit/implementation/dragon";
import { Ent } from "../units/recruit/implementation/ent";
import { Fox } from "../units/recruit/implementation/fox";
import { GoGoat } from "../units/recruit/implementation/go-goat";
import { ParadiseBird } from "../units/recruit/implementation/paradise-bird";
import { WhiteStag } from "../units/recruit/implementation/white-stag";
import { AnyUnit } from "../units/recruit/unit";
import { Opponent } from "./match-maker";
import {
	SerializedBarrackType,
	SerializedBoard,
	SerializedCell,
	SerializedElement,
	SerializedEnvironmentType,
	SerializedFaction,
	SerializedTotemType,
	SerializedTowerType,
	SerializedTrapType,
	SerializedUnitType,
} from "./serialized-board";

type Constructor<T> = new (cell: Cell) => T;

const towers: Record<SerializedTowerType, Constructor<AnyTower>> = {
	blue: BlueTower,
	drill: DrillTower,
	frost: FrostTower,
	green: GreenTower,
	"witch-house": WitchHouse,
	zapping: ZappingTower,
};

const totems: Record<SerializedTotemType, Constructor<AnyTotem>> = {
	anvil: AnvilTotem,
	bakery: Bakery,
	brewery: Brewery,
	"crops-field": CropsField,
	"gobelin-portal": GobelinPortal,
	mine: Mine,
	"red-obelisk": RedObelisk,
	"powder-magazine": PowderMagazine,
	windmill: Windmill,
};

const barracks: Record<SerializedBarrackType, Constructor<AnyBarrack>> = {
	basic: BasicBarrack,
	veterant: VeterantBarrack,
	wave: WaveBarrack,
};

const units: Record<SerializedUnitType, Constructor<AnyUnit>> = {
	brewmaster: Brewmaster,
	choupisson: Choupisson,
	dragon: Dragon,
	ent: Ent,
	fox: Fox,
	"go-goat": GoGoat,
	"paradise-bird": ParadiseBird,
	"white-stag": WhiteStag,
};

const traps: Record<SerializedTrapType, Constructor<AnyTrap>> = {
	slowing: SlowingTrap,
	stun: StunTrap,
};

const environment: Record<SerializedEnvironmentType, Constructor<Rock | Forest>> = {
	forest: Forest,
	rock: Rock,
};

const factions: Record<
	SerializedFaction,
	{ castle: (cell: Cell) => AnyCastle; defaultUnit: () => Army["defaultUnit"] }
> = {
	Dwarf: {
		castle: (cell) => new DwarfCastle(new DwarfCastleBlueprint({}), cell),
		defaultUnit: () => new DwarfBlueprint({}),
	},
	Elf: { castle: (cell) => new ElfCastle(new ElfCastleBlueprint({}), cell), defaultUnit: () => new ElfBlueprint({}) },
};

// The key of the registry entry whose class built `element`.
const typeOf = <K extends string, T>(registry: Record<K, Constructor<T>>, element: object): K => {
	const entry = Object.entries<Constructor<T>>(registry).find(([, constructor]) => element instanceof constructor);
	if (!entry) throw new Error(`No serialized type for ${element.constructor.name}`);
	return entry[0] as K;
};

const toCell = ({ x, y }: SerializedCell) => new Cell({ x, y });
const fromCell = ({ x, y }: Cell): SerializedCell => ({ x, y });

export const serializeBoard = (army: Army, round: number, randomSeed: number): SerializedBoard => {
	const { grid } = army;
	const castle = army.castle;
	const faction: SerializedFaction = castle instanceof DwarfCastle ? "Dwarf" : "Elf";
	const elements: SerializedElement[] = [
		{ kind: "castle", cell: fromCell(castle.cell) },
		...army.towers.map(
			(tower): SerializedElement => ({
				kind: "tower",
				type: typeOf(towers, tower),
				cell: fromCell(tower.cell),
			}),
		),
		...army.totems.map(
			(totem): SerializedElement => ({
				kind: "totem",
				type: typeOf(totems, totem),
				cell: fromCell(totem.cell),
			}),
		),
		...army.barracks.map(
			(barrack): SerializedElement => ({
				kind: "barrack",
				type: typeOf(barracks, barrack),
				cell: fromCell(barrack.cell),
				unit: barrack.unitRecruit ? typeOf(units, barrack.unitRecruit) : null,
			}),
		),
		...army.pathTiles.map(
			(tile): SerializedElement => ({
				kind: "path",
				cell: fromCell(tile.cell),
				trap: tile.trap ? typeOf(traps, tile.trap) : null,
				connectionChoice: tile.connectionChoice?.map(fromCell) ?? null,
			}),
		),
		...army.environment.map(
			(element): SerializedElement => ({
				kind: "environment",
				type: typeOf(environment, element),
				cell: fromCell(element.cell),
			}),
		),
	];
	return { round, faction, size: { width: grid.width, height: grid.height }, randomSeed, elements };
};

const deserializeElement = (element: SerializedElement, faction: SerializedFaction) => {
	const cell = toCell(element.cell);
	switch (element.kind) {
		case "castle":
			return factions[faction].castle(cell);
		case "tower":
			return new towers[element.type](cell);
		case "totem":
			return new totems[element.type](cell);
		case "barrack": {
			const barrack = new barracks[element.type](cell);
			if (element.unit) barrack.setUnit(new units[element.unit](new Cell({ x: 0, y: 0 })));
			return barrack;
		}
		case "path": {
			const tile = new BasicPathTile(cell);
			if (element.trap) tile.attachTrap(new traps[element.trap](cell.clone()));
			tile.connectionChoice = element.connectionChoice?.map(toCell) ?? null;
			return tile;
		}
		case "environment":
			return new environment[element.type](cell);
	}
};

export const deserializeBoard = (board: SerializedBoard): Opponent => {
	const grid = ArmyGrid.sized(board.size);
	board.elements.forEach((element) => grid.setElement(deserializeElement(element, board.faction)));
	const army = new Army(grid, new Inventory(), factions[board.faction].defaultUnit());
	return { army, randomSeed: board.randomSeed };
};
