import { Injectable } from "@nestjs/common";

export type HealthStatus = {
	status: "ok";
	uptime: number;
};

@Injectable()
export class HealthService {
	check(): HealthStatus {
		return { status: "ok", uptime: process.uptime() };
	}
}
