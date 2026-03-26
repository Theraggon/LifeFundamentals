export function isPostgresUniqueViolation(error: unknown): boolean {
	let current: unknown = error;
	for (let depth = 0; depth < 6 && current; depth++) {
		if (
			current &&
			typeof current === 'object' &&
			'code' in current &&
			(current as { code: unknown }).code === '23505'
		) {
			return true;
		}
		if (current && typeof current === 'object' && 'cause' in current) {
			current = (current as { cause: unknown }).cause;
			continue;
		}
		break;
	}
	return false;
}
