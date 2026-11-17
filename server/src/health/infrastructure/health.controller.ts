import { Controller, Get } from "@nestjs/common";
import { CheckHealth } from "../applicative/commands/check-health.use-case.js";
import type { HealthStatus } from "../domain/health-status.js";

@Controller("health")
export class HealthController {
	constructor(private readonly checkHealth: CheckHealth) {}

	@Get()
	check(): HealthStatus {
		return this.checkHealth.execute();
	}
}
