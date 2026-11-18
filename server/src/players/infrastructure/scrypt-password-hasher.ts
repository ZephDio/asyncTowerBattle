import { randomBytes, type ScryptOptions, scrypt, timingSafeEqual } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { PasswordHasher } from "../applicative/interfaces/password-hasher.js";

const derive = (password: string, salt: Buffer, length: number, options: ScryptOptions) =>
	new Promise<Buffer>((resolve, reject) =>
		scrypt(password, salt, length, options, (error, key) => (error ? reject(error) : resolve(key))),
	);

// One of the scrypt costs OWASP recommends, the one with 64 MiB per hash. A hash keeps the costs it was made with, so
// raising them later still checks the older hashes.
const COST = { N: 2 ** 16, r: 8, p: 2 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
// scrypt needs 128 * N * r bytes; Node refuses more than 32 MiB by default.
const maxmem = (N: number, r: number) => 256 * N * r;

// A hash reads `scrypt$<N>$<r>$<p>$<salt>$<key>`, salt and key in base64url.
@Injectable()
export class ScryptPasswordHasher extends PasswordHasher {
	async hash(password: string) {
		const { N, r, p } = COST;
		const salt = randomBytes(SALT_LENGTH);
		const key = await derive(password, salt, KEY_LENGTH, { N, r, p, maxmem: maxmem(N, r) });
		return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
	}

	async verify(password: string, hash: string) {
		const [algorithm, N, r, p, salt, key] = hash.split("$");
		if (algorithm !== "scrypt" || !salt || !key) return false;
		const expected = Buffer.from(key, "base64url");
		const options = { N: Number(N), r: Number(r), p: Number(p), maxmem: maxmem(Number(N), Number(r)) };
		const actual = await derive(password, Buffer.from(salt, "base64url"), expected.length, options);
		return timingSafeEqual(actual, expected);
	}
}
