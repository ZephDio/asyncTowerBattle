import { ScryptPasswordHasher } from "./scrypt-password-hasher.js";

describe("ScryptPasswordHasher", () => {
	const hasher = new ScryptPasswordHasher();

	it("checks a password against its hash, which does not contain it", async () => {
		const hash = await hasher.hash("hunter22");

		expect(hash).not.toContain("hunter22");
		expect(await hasher.verify("hunter22", hash)).toBe(true);
		expect(await hasher.verify("hunter23", hash)).toBe(false);
	});

	it("salts each hash", async () => {
		expect(await hasher.hash("hunter22")).not.toBe(await hasher.hash("hunter22"));
	});

	it("refuses a hash it did not make", async () => {
		expect(await hasher.verify("hunter22", "plain:hunter22")).toBe(false);
	});
});
