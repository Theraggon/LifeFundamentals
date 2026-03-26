import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export async function resetApiTables() {
	await db.execute(
		sql.raw(
			'TRUNCATE TABLE content_tags, content, tags, categories RESTART IDENTITY CASCADE'
		)
	);
}
