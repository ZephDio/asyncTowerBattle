import { BadRequestException } from "@nestjs/common";
import {
	isBoard,
	isCell,
	isNumber,
	isPerformance,
	isRecord,
	isString,
} from "../../opponents/infrastructure/pull-request-body.js";
import type { SavedGame, SavedItem, SavedOpponent } from "../domain/current-game.js";

const isItem = (value: unknown): value is SavedItem =>
	isRecord(value) && isString(value["kind"]) && isCell(value["cell"]);

const isOpponent = (value: unknown): value is SavedOpponent =>
	isRecord(value) && isBoard(value["board"]) && isString(value["playerName"]);

// The body of PUT /current-game once its shape is checked: every field present with the JSON type it should have. The
// rules (rounds, counts, the opponent of a battle) are the domain's, checked by CurrentGame.
export const parseSavedGame = (body: unknown): SavedGame => {
	if (!isRecord(body)) throw new BadRequestException("Expected a saved game");
	const { phase, life, gold, performance, board, inventory, opponent } = body;
	if (phase !== "shop" && phase !== "battle") throw new BadRequestException("The phase is shop or battle");
	if (!isNumber(life) || !isNumber(gold)) throw new BadRequestException("The life and the gold are numbers");
	if (!isPerformance(performance)) throw new BadRequestException("The performance needs wins and losses");
	if (!isBoard(board)) throw new BadRequestException("The board isn't a serialized board");
	if (!Array.isArray(inventory) || !inventory.every(isItem)) {
		throw new BadRequestException("The inventory is a list of pieces with a kind and a cell");
	}
	if (opponent !== null && !isOpponent(opponent)) {
		throw new BadRequestException("The opponent is null or a serialized board with a player name");
	}
	return { phase, life, gold, performance, board, inventory, opponent };
};
