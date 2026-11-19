import { Module } from "@nestjs/common";
import { IdProvider } from "./applicative/interfaces/id-provider.js";
import { RandomProvider } from "./applicative/interfaces/random-provider.js";
import { MathRandomProvider } from "./infrastructure/math-random-provider.js";
import { UuidProvider } from "./infrastructure/uuid-provider.js";

// What every module's use cases need, whatever their domain.
@Module({
	providers: [
		{ provide: IdProvider, useClass: UuidProvider },
		{ provide: RandomProvider, useClass: MathRandomProvider },
	],
	exports: [IdProvider, RandomProvider],
})
export class SharedModule {}
