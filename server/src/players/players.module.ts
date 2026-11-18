import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../database/database.module.js";
import { SharedModule } from "../shared/shared.module.js";
import { LoginWithGoogle } from "./applicative/commands/login-with-google.use-case.js";
import { Logout } from "./applicative/commands/logout.use-case.js";
import { RefreshSession } from "./applicative/commands/refresh-session.use-case.js";
import { RegisterWithGoogle } from "./applicative/commands/register-with-google.use-case.js";
import { AccessTokens } from "./applicative/interfaces/access-tokens.js";
import { GoogleIdentityVerifier } from "./applicative/interfaces/google-identity.verifier.js";
import { PlayerStore } from "./applicative/interfaces/player.store.js";
import { RefreshTokenStore } from "./applicative/interfaces/refresh-token.store.js";
import { GetPlayer } from "./applicative/queries/get-player.use-case.js";
import { SessionOpener } from "./applicative/session-opener.js";
import { AccessTokenGuard, OptionalAccessTokenGuard } from "./infrastructure/access-token.guard.js";
import { AuthController } from "./infrastructure/auth.controller.js";
import { GoogleAuthLibraryVerifier } from "./infrastructure/google-auth-library.verifier.js";
import { JwtAccessTokens } from "./infrastructure/jwt-access-tokens.js";
import { PlayersController } from "./infrastructure/players.controller.js";
import { PrismaPlayerStore } from "./infrastructure/prisma-player.store.js";
import { PrismaRefreshTokenStore } from "./infrastructure/prisma-refresh-token.store.js";

const ACCESS_TOKEN_LIFETIME_S = 15 * 60;

@Module({
	imports: [
		DatabaseModule,
		SharedModule,
		// Read when the module is built, so the server refuses to start without a secret.
		JwtModule.registerAsync({
			useFactory: () => {
				const secret = process.env["JWT_SECRET"];
				if (!secret) throw new Error("JWT_SECRET is not set");
				return { secret, signOptions: { expiresIn: ACCESS_TOKEN_LIFETIME_S } };
			},
		}),
	],
	controllers: [AuthController, PlayersController],
	providers: [
		RegisterWithGoogle,
		LoginWithGoogle,
		RefreshSession,
		Logout,
		GetPlayer,
		SessionOpener,
		AccessTokenGuard,
		OptionalAccessTokenGuard,
		{ provide: AccessTokens, useClass: JwtAccessTokens },
		{ provide: GoogleIdentityVerifier, useClass: GoogleAuthLibraryVerifier },
		{ provide: PlayerStore, useClass: PrismaPlayerStore },
		{ provide: RefreshTokenStore, useClass: PrismaRefreshTokenStore },
	],
	// For the other modules' routes that need a logged-in player, or that know them when there is one.
	exports: [AccessTokens, AccessTokenGuard, OptionalAccessTokenGuard],
})
export class PlayersModule {}
