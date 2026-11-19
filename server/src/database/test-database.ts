// The integration tests run against the database that `pnpm test:integration` migrates, and every test empties the
// tables it uses, so they refuse to start on any database whose URL doesn't name a test database.
export const assertTestDatabase = () => {
	const url = process.env["DATABASE_URL"];
	if (url?.includes("_test")) return;
	throw new Error(`The integration tests empty their database, refusing DATABASE_URL ${url}`);
};
