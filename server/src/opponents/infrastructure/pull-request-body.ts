import { BadRequestException } from "@nestjs/common";
import type { GamePerformance } from "../domain/player-board.js";
import type { SerializedBoard, SerializedCell, SerializedElement } from "../domain/serialized-board.js";

// The body of POST /opponents/:round once its shape is checked: every field present with the JSON type it should
// have. The rules (grid size of the round, random seed range, counts) are the domain's, checked by PlayerBoard.
export type PullRequestBody = { board: SerializedBoard; performance: GamePerformance };

const FACTIONS = ["Dwarf", "Elf"];

type Json = Record<string, unknown>;

export const isRecord = (value: unknown): value is Json =>
	typeof value === "object" && value !== null && !Array.isArray(value);
export const isNumber = (value: unknown): value is number => typeof value === "number";
export const isString = (value: unknown): value is string => typeof value === "string";
export const isCell = (value: unknown): value is SerializedCell =>
	isRecord(value) && isNumber(value["x"]) && isNumber(value["y"]);
const isNullOr = (value: unknown, check: (value: unknown) => boolean) => value === null || check(value);

// Piece types are only checked to be strings: a type the server doesn't know yet is a new piece of a newer client,
// which other clients of the same version can play.
const ELEMENT_SHAPES: Record<SerializedElement["kind"], (element: Json) => boolean> = {
	castle: () => true,
	tower: (element) => isString(element["type"]),
	totem: (element) => isString(element["type"]),
	barrack: (element) => isString(element["type"]) && isNullOr(element["unit"], isString),
	path: (element) =>
		isNullOr(element["trap"], isString) &&
		isNullOr(element["connectionChoice"], (choice) => Array.isArray(choice) && choice.every(isCell)),
	environment: (element) => isString(element["type"]),
};

const isElement = (value: unknown) => {
	if (!isRecord(value) || !isCell(value["cell"]) || !isString(value["kind"])) return false;
	const shape = ELEMENT_SHAPES[value["kind"] as SerializedElement["kind"]];
	return shape !== undefined && shape(value);
};

export const isBoard = (value: unknown): value is SerializedBoard =>
	isRecord(value) &&
	isNumber(value["round"]) &&
	isString(value["faction"]) &&
	FACTIONS.includes(value["faction"]) &&
	isRecord(value["size"]) &&
	isNumber(value["size"]["width"]) &&
	isNumber(value["size"]["height"]) &&
	isNumber(value["randomSeed"]) &&
	Array.isArray(value["elements"]) &&
	value["elements"].every(isElement);

export const isPerformance = (value: unknown): value is GamePerformance =>
	isRecord(value) && isNumber(value["wins"]) && isNumber(value["losses"]);

// Refuses with a 400 a body that isn't a board and a performance, before any use case sees it.
export const parsePullRequestBody = (body: unknown): PullRequestBody => {
	if (!isRecord(body)) throw new BadRequestException("Expected a board and a performance");
	const { board, performance } = body;
	if (!isBoard(board)) throw new BadRequestException("The board isn't a serialized board");
	if (!isPerformance(performance)) throw new BadRequestException("The performance needs wins and losses");
	return { board, performance };
};
