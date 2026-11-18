import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokens } from "../applicative/interfaces/access-tokens.js";

// Access tokens are JWTs signed with JWT_SECRET (see players.module.ts), with the player id as subject.
@Injectable()
export class JwtAccessTokens extends AccessTokens {
	constructor(private readonly jwt: JwtService) {
		super();
	}

	async issue(playerId: string) {
		return this.jwt.signAsync({ sub: playerId });
	}

	async verify(token: string) {
		return this.jwt
			.verifyAsync<{ sub: string }>(token)
			.then(({ sub }) => sub)
			.catch(() => undefined);
	}
}
