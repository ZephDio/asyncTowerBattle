import { Injectable } from "@nestjs/common";
import type { HealthStatus } from "../../domain/health-status.js";

@Injectable()
export class CheckHealth {
	execute(): HealthStatus {
		return { status: "ok", uptime: process.uptime() };
	}
}
