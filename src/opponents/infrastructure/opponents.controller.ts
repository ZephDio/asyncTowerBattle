import { BadRequestException, Controller, Get, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";
import { GetOpponent } from "../applicative/commands/get-opponent.use-case.js";
import { NoOpponentError } from "../applicative/opponent-errors.js";
import { InvalidRoundError } from "../domain/opponent-errors.js";
import type { SerializedBoard } from "../domain/serialized-board.js";

@Controller("opponents")
export class OpponentsController {
	constructor(private readonly getOpponent: GetOpponent) {}

	@Get(":round")
	get(@Param("round", ParseIntPipe) round: number): SerializedBoard {
		try {
			return this.getOpponent.execute(round);
		} catch (error) {
			if (error instanceof InvalidRoundError) throw new BadRequestException(error.message);
			if (error instanceof NoOpponentError) throw new NotFoundException(error.message);
			throw error;
		}
	}
}
