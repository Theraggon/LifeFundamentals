import { beforeAll } from 'vitest';

beforeAll(() => {
	if (!process.env.DATABASE_URL) {
		throw new Error(
			'DATABASE_URL is required for server tests. Copy .env.example to .env or set DATABASE_URL before running Vitest.'
		);
	}
});
