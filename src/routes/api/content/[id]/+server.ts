import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories, content, contentTags, tags } from '$lib/server/db/schema';
import { isPostgresUniqueViolation } from '$lib/server/pg-errors';
import { slugify } from '$lib/server/slug';
import { eq, inArray } from 'drizzle-orm';
import type { RequestHandler } from './$types';

function parseId(param: string): number | null {
	const id = parseInt(param, 10);
	return Number.isInteger(id) ? id : null;
}

export const GET: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id === null) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}

	try {
		const [row] = await db
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
			.where(eq(content.id, id))
			.limit(1);

		if (!row) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		const junctions = await db.select().from(contentTags).where(eq(contentTags.contentId, id));
		const tagIds = junctions.map((j) => j.tagId);
		const tagRows =
			tagIds.length > 0 ? await db.select().from(tags).where(inArray(tags.id, tagIds)) : [];

		return json({ ...row, tags: tagRows });
	} catch (error) {
		console.error('Error fetching content:', error);
		return json({ error: 'Failed to fetch content' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseId(params.id);
	if (id === null) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}

	try {
		const [existing] = await db.select().from(content).where(eq(content.id, id)).limit(1);
		if (!existing) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		const body = await request.json();
		const updates: Partial<typeof content.$inferInsert> = {};

		if (typeof body.title === 'string') {
			const t = body.title.trim();
			if (!t) {
				return json({ error: 'Title cannot be empty' }, { status: 400 });
			}
			updates.title = t;
		}

		if (typeof body.summary === 'string') {
			const s = body.summary.trim();
			if (!s) {
				return json({ error: 'Summary cannot be empty' }, { status: 400 });
			}
			updates.summary = s;
		}

		if (typeof body.slug === 'string') {
			const s = slugify(body.slug.trim());
			if (!s) {
				return json({ error: 'Invalid slug' }, { status: 400 });
			}
			updates.slug = s;
		}

		if (body.sourceUrl !== undefined) {
			updates.sourceUrl =
				body.sourceUrl === null || body.sourceUrl === ''
					? null
					: typeof body.sourceUrl === 'string'
						? body.sourceUrl.trim() || null
						: null;
		}

		if (body.categoryId !== undefined) {
			if (body.categoryId === null) {
				updates.categoryId = null;
			} else {
				const cid = Number(body.categoryId);
				if (!Number.isInteger(cid)) {
					return json({ error: 'Invalid category' }, { status: 400 });
				}
				const [cat] = await db.select().from(categories).where(eq(categories.id, cid)).limit(1);
				if (!cat) {
					return json({ error: 'Invalid category' }, { status: 400 });
				}
				updates.categoryId = cid;
			}
		}

		if (typeof body.isPublished === 'boolean') {
			updates.isPublished = body.isPublished;
		}

		let didScalarUpdate = false;
		if (Object.keys(updates).length > 0) {
			updates.updatedAt = new Date();
			await db.update(content).set(updates).where(eq(content.id, id));
			didScalarUpdate = true;
		}

		if (Array.isArray(body.tagIds)) {
			const tagIds: number[] = [
				...new Set(body.tagIds.map((x: unknown) => Number(x)).filter((n) => Number.isInteger(n)))
			];
			if (tagIds.length > 0) {
				const found = await db.select().from(tags).where(inArray(tags.id, tagIds));
				if (found.length !== tagIds.length) {
					return json({ error: 'Unknown tag id' }, { status: 400 });
				}
			}
			await db.delete(contentTags).where(eq(contentTags.contentId, id));
			if (tagIds.length > 0) {
				await db.insert(contentTags).values(tagIds.map((tagId) => ({ contentId: id, tagId })));
			}
			if (!didScalarUpdate) {
				await db.update(content).set({ updatedAt: new Date() }).where(eq(content.id, id));
			}
		}

		const [row] = await db
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
			.where(eq(content.id, id))
			.limit(1);

		const junctions = await db.select().from(contentTags).where(eq(contentTags.contentId, id));
		const tagIdList = junctions.map((j) => j.tagId);
		const tagRows =
			tagIdList.length > 0 ? await db.select().from(tags).where(inArray(tags.id, tagIdList)) : [];

		return json({ ...row!, tags: tagRows });
	} catch (error) {
		console.error('Error updating content:', error);
		if (isPostgresUniqueViolation(error)) {
			return json({ error: 'An article with this slug already exists' }, { status: 409 });
		}
		return json({ error: 'Failed to update content' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseId(params.id);
	if (id === null) {
		return json({ error: 'Invalid id' }, { status: 400 });
	}

	try {
		const [existing] = await db.select().from(content).where(eq(content.id, id)).limit(1);
		if (!existing) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		await db.delete(contentTags).where(eq(contentTags.contentId, id));
		await db.delete(content).where(eq(content.id, id));

		return json({ message: 'Deleted' });
	} catch (error) {
		console.error('Error deleting content:', error);
		return json({ error: 'Failed to delete content' }, { status: 500 });
	}
};
