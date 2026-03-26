import { vi } from 'vitest';

type MockConsoleOptions = {
	allow?: Array<string | RegExp>;
	failOnUnexpected?: boolean;
};

function isAllowed(message: string, allow: Array<string | RegExp>): boolean {
	if (allow.length === 0) return true;
	return allow.some((pattern) =>
		typeof pattern === 'string' ? message.includes(pattern) : pattern.test(message)
	);
}

export function mockConsoleError(options: MockConsoleOptions = {}) {
	const { allow = [], failOnUnexpected = false } = options;
	const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
		const message = args
			.map((arg) => {
				if (typeof arg === 'string') return arg;
				if (arg instanceof Error && arg.message) return arg.message;
				try {
					return JSON.stringify(arg);
				} catch {
					return String(arg);
				}
			})
			.join(' ');

		const allowed = isAllowed(message, allow);
		if (failOnUnexpected && !allowed) {
			spy.mockRestore();
			throw new Error(`Unexpected console.error: ${message}`);
		}
	});

	return () => spy.mockRestore();
}

export async function withMockConsoleError<T>(
	fn: () => Promise<T> | T,
	options?: MockConsoleOptions
): Promise<T> {
	const restore = mockConsoleError(options);
	try {
		return await fn();
	} finally {
		restore();
	}
}
