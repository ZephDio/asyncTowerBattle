import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	NotFoundException,
	Post,
	UnauthorizedException,
} from "@nestjs/common";
import { LoginWithGoogle } from "../applicative/commands/login-with-google.use-case.js";
import { Logout } from "../applicative/commands/logout.use-case.js";
import { RefreshSession } from "../applicative/commands/refresh-session.use-case.js";
import { LoginWithPassword } from "../applicative/commands/login-with-password.use-case.js";
import { RegisterWithGoogle } from "../applicative/commands/register-with-google.use-case.js";
import { RegisterWithPassword } from "../applicative/commands/register-with-password.use-case.js";
import {
	AccountExistsError,
	EmailTakenError,
	InvalidGoogleCredentialError,
	InvalidPasswordLoginError,
	InvalidRefreshTokenError,
	NameTakenError,
	NoAccountError,
} from "../applicative/player-errors.js";
import type { Session } from "../applicative/session-opener.js";
import { InvalidEmailError, InvalidPasswordError, InvalidPlayerNameError } from "../domain/player-errors.js";

const requireString = (body: Record<string, unknown> | undefined, field: string): string => {
	const value = body?.[field];
	if (typeof value !== "string" || value === "") throw new BadRequestException(`Expected a ${field}`);
	return value;
};

const toHttpError = (error: unknown) => {
	if (
		error instanceof InvalidPlayerNameError ||
		error instanceof InvalidEmailError ||
		error instanceof InvalidPasswordError
	) {
		return new BadRequestException(error.message);
	}
	if (
		error instanceof InvalidGoogleCredentialError ||
		error instanceof InvalidPasswordLoginError ||
		error instanceof InvalidRefreshTokenError
	) {
		return new UnauthorizedException(error.message);
	}
	if (error instanceof NoAccountError) return new NotFoundException(error.message);
	if (error instanceof AccountExistsError || error instanceof EmailTakenError || error instanceof NameTakenError) {
		return new ConflictException(error.message);
	}
	return error;
};

// The `credential` is the ID token the Google sign-in button gives the client. A password is sent as typed, over HTTPS.
@Controller("auth")
export class AuthController {
	constructor(
		private readonly registerWithGoogle: RegisterWithGoogle,
		private readonly loginWithGoogle: LoginWithGoogle,
		private readonly registerWithPassword: RegisterWithPassword,
		private readonly loginWithPassword: LoginWithPassword,
		private readonly refreshSession: RefreshSession,
		private readonly logout: Logout,
	) {}

	@Post("google/register")
	async register(@Body() body?: Record<string, unknown>): Promise<Session> {
		const request = { credential: requireString(body, "credential"), name: requireString(body, "name") };
		return this.registerWithGoogle.execute(request).catch((error) => Promise.reject(toHttpError(error)));
	}

	@Post("google/login")
	@HttpCode(200)
	async login(@Body() body?: Record<string, unknown>): Promise<Session> {
		const request = { credential: requireString(body, "credential") };
		return this.loginWithGoogle.execute(request).catch((error) => Promise.reject(toHttpError(error)));
	}

	@Post("password/register")
	async registerPassword(@Body() body?: Record<string, unknown>): Promise<Session> {
		const request = {
			email: requireString(body, "email"),
			name: requireString(body, "name"),
			password: requireString(body, "password"),
		};
		return this.registerWithPassword.execute(request).catch((error) => Promise.reject(toHttpError(error)));
	}

	@Post("password/login")
	@HttpCode(200)
	async loginPassword(@Body() body?: Record<string, unknown>): Promise<Session> {
		const request = { identifier: requireString(body, "identifier"), password: requireString(body, "password") };
		return this.loginWithPassword.execute(request).catch((error) => Promise.reject(toHttpError(error)));
	}

	@Post("refresh")
	@HttpCode(200)
	async refresh(@Body() body?: Record<string, unknown>): Promise<Session> {
		const request = { refreshToken: requireString(body, "refreshToken") };
		return this.refreshSession.execute(request).catch((error) => Promise.reject(toHttpError(error)));
	}

	@Post("logout")
	@HttpCode(204)
	async logOut(@Body() body?: Record<string, unknown>): Promise<void> {
		await this.logout.execute({ refreshToken: requireString(body, "refreshToken") });
	}
}
