import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { OptionalAccessTokenGuard, PlayerId } from "../../players/infrastructure/access-token.guard.js";
import { IdProvider } from "../../shared/applicative/interfaces/id-provider.js";
import { PullOpponent } from "../applicative/commands/pull-opponent.use-case.js";
import type { Opponent } from "../domain/opponent.js";
import { PlayerBoardRuleError } from "../domain/opponent-errors.js";
import { PlayerBoard } from "../domain/player-board.js";
import { parsePullRequestBody } from "./pull-request-body.js";

@Controller("opponents")
export class OpponentsController {
	constructor(
		private readonly pullOpponent: PullOpponent,
		private readonly ids: IdProvider,
	) {}

	// The player sends their board of the round and their performance, and gets an opponent board back, with the name of
	// the player who built it unless it is a default board. A logged-in player sends their access token: their board is
	// stored as theirs, for the next players, the opponent is taken from the others, and they never get one of theirs. A
	// guest's request, or one with `?test=true` (dev mode), only reads: the board is neither stored nor taken from the
	// others.
	@Post(":round")
	@HttpCode(200)
	@UseGuards(OptionalAccessTokenGuard)
	async pull(
		@Param("round", ParseIntPipe) round: number,
		@Body() body: unknown,
		@PlayerId() playerId: string | undefined,
		@Query("test", new ParseBoolPipe({ optional: true })) test?: boolean,
	): Promise<Opponent> {
		const playerBoard = this.toPlayerBoard(round, body, playerId);
		return this.pullOpponent.execute({ playerBoard, test: test ?? false });
	}

	// A request that can't make a valid PlayerBoard misuses the API: a 400, and the use case never sees it.
	private toPlayerBoard(round: number, body: unknown, playerId: string | undefined) {
		const { board, performance } = parsePullRequestBody(body);
		if (board.round !== round) {
			throw new BadRequestException(`Asked for an opponent of round ${round} with a board of round ${board.round}`);
		}
		try {
			return new PlayerBoard({ id: this.ids.next(), board, performance, playerId });
		} catch (error) {
			if (error instanceof PlayerBoardRuleError) throw new BadRequestException(error.message);
			throw error;
		}
	}
}
