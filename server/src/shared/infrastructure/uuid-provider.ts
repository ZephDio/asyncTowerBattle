import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { IdProvider } from "../applicative/interfaces/id-provider.js";

// Random v4 UUIDs, which the database's uuid id columns expect.
@Injectable()
export class UuidProvider extends IdProvider {
	next() {
		return randomUUID();
	}
}
