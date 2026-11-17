import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";
import { OpponentsModule } from "./opponents/opponents.module.js";

@Module({
	imports: [HealthModule, OpponentsModule],
})
export class AppModule {}
