import { Injectable } from "@nestjs/common";
import { RandomProvider } from "../applicative/interfaces/random-provider.js";

// Math.random, read at each call so tests can replace it.
@Injectable()
export class MathRandomProvider extends RandomProvider {
	next() {
		return Math.random();
	}
}
