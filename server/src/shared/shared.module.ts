import { Module } from "@nestjs/common";
import { IdProvider } from "./applicative/interfaces/id-provider.js";
import { UuidProvider } from "./infrastructure/uuid-provider.js";

// What every module's use cases need, whatever their domain.
@Module({
	providers: [{ provide: IdProvider, useClass: UuidProvider }],
	exports: [IdProvider],
})
export class SharedModule {}
