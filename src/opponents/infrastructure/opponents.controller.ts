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
} from "@nestjs/common";
import { PullOpponent } from "../applicative/commands/pull-opponent.use-case.js";
import { BoardRoundMismatchError, NoOpponentError } from "../applicative/opponent-errors.js";
import { InvalidPerformanceError, InvalidRoundError } from "../domain/opponent-errors.js";
import type { PlayerBoard } from "../domain/player-board.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

@Controller("opponents")
export class OpponentsController {
	constructor(private readonly pullOpponent: PullOpponent) {}

	// The player sends their board of the round and their performance, and gets an opponent board back. With
	// `?test=true` the board is neither stored nor taken from the others, so test runs don't publish their boards.
	@Post(":round")
	@HttpCode(200)
	pull(
		@Param("round", ParseIntPipe) round: number,
		@Body() body: PlayerBoard,
		@Query("test", new ParseBoolPipe({ optional: true })) test?: boolean,
	): SerializedBoard {
		if (typeof body?.board !== "object" || typeof body?.performance !== "object") {
			throw new BadRequestException("Expected a board and a performance");
		}
		try {
			return this.pullOpponent.execute({
				round,
				board: body.board,
				performance: body.performance,
				test: test ?? false,
			});
		} catch (error) {
			if (
				error instanceof InvalidRoundError ||
				error instanceof BoardRoundMismatchError ||
				error instanceof InvalidPerformanceError
			) {
				throw new BadRequestException(error.message);
			}
			if (error instanceof NoOpponentError) throw new NotFoundException(error.message);
			throw error;
		}
	}
}
