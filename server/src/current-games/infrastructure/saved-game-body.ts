import { BadRequestException } from "@nestjs/common";
import {
	isBoard,
	isCell,
	isNumber,
	isPerformance,
	isRecord,
	isString,
} from "../../opponents/infrastructure/pull-request-body.js";
import type { SavedGame, SavedItem, SavedOffer, SavedOpponent } from "../domain/current-game.js";

const isItem = (value: unknown): value is SavedItem =>
	isRecord(value) && isString(value["kind"]) && isCell(value["cell"]);

const isOffer = (value: unknown): value is SavedOffer =>
	isRecord(value) &&
	isItem(value["item"]) &&
	isNumber(value["price"]) &&
	Number.isInteger(value["price"]) &&
	value["price"] >= 0;

const isOpponent = (value: unknown): value is SavedOpponent =>
	isRecord(value) && isBoard(value["board"]) && isString(value["playerName"]);

// The body of PUT /current-game once its shape is checked: every field present with the JSON type it should have. The
// rules (rounds, counts, the opponent of a battle) are the domain's, checked by CurrentGame.
export const parseSavedGame = (body: unknown): SavedGame => {
	if (!isRecord(body)) throw new BadRequestException("Expected a saved game");
	const { phase, runSeed, life, gold, performance, board, inventory, reservedOffers = [], opponent } = body;
	if (phase !== "shop" && phase !== "battle") throw new BadRequestException("The phase is shop or battle");
	if (!isNumber(runSeed) || !isNumber(life) || !isNumber(gold)) {
		throw new BadRequestException("The run seed, the life and the gold are numbers");
	}
	if (!isPerformance(performance)) throw new BadRequestException("The performance needs wins and losses");
	if (!isBoard(board)) throw new BadRequestException("The board isn't a serialized board");
	if (!Array.isArray(inventory) || !inventory.every(isItem)) {
		throw new BadRequestException("The inventory is a list of pieces with a kind and a cell");
	}
	if (!Array.isArray(reservedOffers) || !reservedOffers.every(isOffer)) {
		throw new BadRequestException("The reserved offers are a list of pieces with a price");
	}
	if (opponent !== null && !isOpponent(opponent)) {
		throw new BadRequestException("The opponent is null or a serialized board with a player name");
	}
	return { phase, runSeed, life, gold, performance, board, inventory, reservedOffers, opponent };
};
