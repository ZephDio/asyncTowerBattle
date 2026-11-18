import {
	type CanActivate,
	createParamDecorator,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AccessTokens } from "../applicative/interfaces/access-tokens.js";

type AuthenticatedRequest = Request & { playerId?: string };

const bearerToken = (request: Request) => request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];

// Lets through the requests with a valid `Authorization: Bearer <access token>`, and gives their handler the player
// through @PlayerId().
@Injectable()
export class AccessTokenGuard implements CanActivate {
	constructor(private readonly accessTokens: AccessTokens) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = bearerToken(request);
		const playerId = token && (await this.accessTokens.verify(token));
		if (!playerId) throw new UnauthorizedException("Missing or invalid access token");
		request.playerId = playerId;
		return true;
	}
}

// For the routes guests use too: lets through the requests without an access token, with an undefined @PlayerId().
// An invalid or expired token is still refused, so the client refreshes it instead of playing as a guest.
@Injectable()
export class OptionalAccessTokenGuard implements CanActivate {
	constructor(private readonly accessTokens: AccessTokens) {}

	async canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = bearerToken(request);
		if (!token) return true;
		const playerId = await this.accessTokens.verify(token);
		if (!playerId) throw new UnauthorizedException("Invalid access token");
		request.playerId = playerId;
		return true;
	}
}

export const PlayerId = createParamDecorator(
	(_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<AuthenticatedRequest>().playerId,
);
