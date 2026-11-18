import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";
import { OpponentsModule } from "./opponents/opponents.module.js";
import { PlayersModule } from "./players/players.module.js";

@Module({
	imports: [HealthModule, OpponentsModule, PlayersModule],
})
export class AppModule {}
