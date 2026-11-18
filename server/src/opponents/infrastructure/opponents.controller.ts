import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	ParseBoolPipe,
	ParseIntPipe,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { OptionalAccessTokenGuard, PlayerId } from "../../players/infrastructure/access-token.guard.js";
import { PullOpponent } from "../applicative/commands/pull-opponent.use-case.js";
import { BoardRoundMismatchError, NoOpponentError } from "../applicative/opponent-errors.js";
import {
	InvalidBoardSizeError,
	InvalidPerformanceError,
	InvalidRandomSeedError,
	InvalidRoundError,
} from "../domain/opponent-errors.js";
import type { Opponent } from "../domain/opponent.js";
import type { GamePerformance } from "../domain/player-board.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

@Controller("opponents")
export class OpponentsController {
	constructor(private readonly pullOpponent: PullOpponent) {}

	// The player sends their board of the round and their performance, and gets an opponent board back, with the name of
	// the player who built it unless it is a seed board. A logged-in player sends their access token: their board is
	// stored as theirs, for the next players, the opponent is taken from the others, and they never get one of theirs. A
	// guest's request, or one with `?test=true` (dev mode), only reads: the board is neither stored nor taken from the
	// others.
	@Post(":round")
	@HttpCode(200)
	@UseGuards(OptionalAccessTokenGuard)
	async pull(
		@Param("round", ParseIntPipe) round: number,
		@Body() body: { board: SerializedBoard; performance: GamePerformance },
		@PlayerId() playerId: string | undefined,
		@Query("test", new ParseBoolPipe({ optional: true })) test?: boolean,
	): Promise<Opponent> {
		if (typeof body?.board !== "object" || typeof body?.performance !== "object") {
			throw new BadRequestException("Expected a board and a performance");
		}
		try {
			return await this.pullOpponent.execute({
				round,
				board: body.board,
				performance: body.performance,
				playerId,
				test: test ?? false,
			});
		} catch (error) {
			if (
				error instanceof InvalidRoundError ||
				error instanceof BoardRoundMismatchError ||
				error instanceof InvalidBoardSizeError ||
				error instanceof InvalidRandomSeedError ||
				error instanceof InvalidPerformanceError
			) {
				throw new BadRequestException(error.message);
			}
			if (error instanceof NoOpponentError) throw new NotFoundException(error.message);
			throw error;
		}
	}
}
