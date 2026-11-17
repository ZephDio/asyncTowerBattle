import { Module } from "@nestjs/common";
import { CheckHealth } from "./applicative/commands/check-health.use-case.js";
import { HealthController } from "./infrastructure/health.controller.js";

@Module({
	controllers: [HealthController],
	providers: [CheckHealth],
})
export class HealthModule {}
