// Output port of the password use cases: the store only ever sees a password's hash.
export abstract class PasswordHasher {
	// A new salt each time, so two players with the same password get different hashes.
	abstract hash(password: string): Promise<string>;
	abstract verify(password: string, hash: string): Promise<boolean>;
}
