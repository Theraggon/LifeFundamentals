import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories, content, contentTags, tags } from '$lib/server/db/schema';
import { isPostgresUniqueViolation } from '$lib/server/pg-errors';
import { slugify } from '$lib/server/slug';
import { desc, eq, inArray } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const rows = await db
			.select({
				id: content.id,
				title: content.title,
				slug: content.slug,
				summary: content.summary,
				sourceUrl: content.sourceUrl,
				categoryId: content.categoryId,
				categoryName: categories.name,
				isPublished: content.isPublished,
				createdAt: content.createdAt,
				updatedAt: content.updatedAt
			})
			.from(content)
			.leftJoin(categories, eq(content.categoryId, categories.id))
			.orderBy(desc(content.updatedAt));

		if (rows.length === 0) {
			return json([]);
		}

		const contentIds = rows.map((r) => r.id);
		const junctions = await db
			.select()
			.from(contentTags)
			.where(inArray(contentTags.contentId, contentIds));

		const allTagIds = [...new Set(junctions.map((j) => j.tagId))];
		const tagById = new Map<number, { id: number; name: string; slug: string }>();
		if (allTagIds.length > 0) {
			const tagRows = await db.select().from(tags).where(inArray(tags.id, allTagIds));
			for (const t of tagRows) {
				tagById.set(t.id, t);
			}
		}

		const tagsByContent = new Map<number, { id: number; name: string; slug: string }[]>();
		for (const j of junctions) {
			const t = tagById.get(j.tagId);
			if (!t) continue;
			const list = tagsByContent.get(j.contentId) ?? [];
			list.push(t);
			tagsByContent.set(j.contentId, list);
		}

		return json(
			rows.map((row) => ({
				...row,
				tags: tagsByContent.get(row.id) ?? []
			}))
		);
	} catch (error) {
		console.error('Error fetching content:', error);
		return json({ error: 'Failed to fetch content' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const title = typeof body.title === 'string' ? body.title.trim() : '';
		const summary = typeof body.summary === 'string' ? body.summary.trim() : '';

		if (!title || !summary) {
			return json({ error: 'Title and summary are required' }, { status: 400 });
		}

		let slug =
			typeof body.slug === 'string' && body.slug.trim()
				? slugify(body.slug.trim())
				: slugify(title);
		if (!slug) {
			return json({ error: 'Could not derive a valid slug from title' }, { status: 400 });
		}

		const sourceUrl =
			typeof body.sourceUrl === 'string' && body.sourceUrl.trim() ? body.sourceUrl.trim() : null;

		let categoryId: number | null = null;
		if (body.categoryId !== undefined && body.categoryId !== null) {
			const cid = Number(body.categoryId);
			if (!Number.isInteger(cid)) {
				return json({ error: 'Invalid category' }, { status: 400 });
			}
			const [cat] = await db.select().from(categories).where(eq(categories.id, cid)).limit(1);
			if (!cat) {
				return json({ error: 'Invalid category' }, { status: 400 });
			}
			categoryId = cid;
		}

		const isPublished = Boolean(body.isPublished);

		const tagIds: number[] = Array.isArray(body.tagIds)
			? [...new Set(body.tagIds.map((x: unknown) => Number(x)).filter((n) => Number.isInteger(n)))]
			: [];

		if (tagIds.length > 0) {
			const found = await db.select().from(tags).where(inArray(tags.id, tagIds));
			if (found.length !== tagIds.length) {
				return json({ error: 'Unknown tag id' }, { status: 400 });
			}
		}

		const [created] = await db
			.insert(content)
			.values({
				title,
				slug,
				summary,
				sourceUrl,
				categoryId,
				isPublished
			})
			.returning();

		if (tagIds.length > 0) {
			await db.insert(contentTags).values(tagIds.map((tagId) => ({ contentId: created.id, tagId })));
		}

		const tagRows =
			tagIds.length > 0 ? await db.select().from(tags).where(inArray(tags.id, tagIds)) : [];

		return json({ ...created, tags: tagRows }, { status: 201 });
	} catch (error) {
		console.error('Error creating content:', error);
		if (isPostgresUniqueViolation(error)) {
			return json({ error: 'An article with this slug already exists' }, { status: 409 });
		}
		return json({ error: 'Failed to create content' }, { status: 500 });
	}
};
