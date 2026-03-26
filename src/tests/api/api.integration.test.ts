import { db } from '$lib/server/db';
import { categories, contentTags, tags } from '$lib/server/db/schema';
import { GET as listCategories } from '../../routes/api/categories/+server';
import { GET as listContent, POST as createContent } from '../../routes/api/content/+server';
import {
	DELETE as deleteContent,
	GET as getContent,
	PATCH as patchContent
} from '../../routes/api/content/[id]/+server';
import { DELETE as deleteTag, GET as listTags, POST as createTag } from '../../routes/api/tags/+server';
import { beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { resetApiTables } from './db-reset';
import { createRequestEvent, httpRequest } from './request-event';
import { withMockConsoleError } from './console-error';

function listContentUrl() {
	return new URL('https://example.com/api/content');
}

function contentIdEvent(method: string, id: string, body?: unknown) {
	const pathname = `/api/content/${id}`;
	const url = new URL(`https://example.com${pathname}`);
	const headers = new Headers();
	if (body !== undefined) headers.set('Content-Type', 'application/json');
	const request = new Request(url, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined
	});
	return createRequestEvent({ url, request, params: { id } });
}

describe.sequential('API route handlers', () => {
	beforeEach(async () => {
		await resetApiTables();
	});

	describe('GET /api/categories', () => {
		it('returns an empty array when there are no categories', async () => {
			const url = new URL('https://example.com/api/categories');
			const res = await listCategories(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			await expect(res.json()).resolves.toEqual([]);
		});

		it('returns categories ordered by name', async () => {
			await db.insert(categories).values([
				{ name: 'Beta', slug: 'beta', description: null },
				{ name: 'Alpha', slug: 'alpha', description: null }
			]);
			const url = new URL('https://example.com/api/categories');
			const res = await listCategories(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body.map((c: { name: string }) => c.name)).toEqual(['Alpha', 'Beta']);
		});
	});

	describe('/api/tags', () => {
		it('returns an empty array when there are no tags', async () => {
			const url = new URL('https://example.com/api/tags');
			const res = await listTags(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			await expect(res.json()).resolves.toEqual([]);
		});

		it('returns all tags', async () => {
			await db.insert(tags).values({ name: 'One', slug: 'one' });
			const url = new URL('https://example.com/api/tags');
			const res = await listTags(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toHaveLength(1);
			expect(body[0].name).toBe('One');
		});

		it('returns 201 and creates a tag', async () => {
			const res = await createTag(
				httpRequest('POST', '/api/tags', { body: { name: '  New Tag  ' } })
			);
			expect(res.status).toBe(201);
			const body = await res.json();
			expect(body.name).toBe('New Tag');
			expect(body.slug).toBe('new-tag');
		});

		it('returns 400 when name is missing', async () => {
			const res = await createTag(httpRequest('POST', '/api/tags', { body: {} }));
			expect(res.status).toBe(400);
		});

		it('returns 409 when name or slug duplicates', async () => {
			await withMockConsoleError(async () => {
				await db.insert(tags).values({ name: 'Dup', slug: 'dup' });
				const res = await createTag(
					httpRequest('POST', '/api/tags', { body: { name: 'Dup' } })
				);
				expect(res.status).toBe(409);
			});
		});

		it('returns 400 when id query is missing on DELETE', async () => {
			const res = await deleteTag(
				createRequestEvent({
					url: new URL('https://example.com/api/tags'),
					request: new Request('https://example.com/api/tags', { method: 'DELETE' })
				})
			);
			expect(res.status).toBe(400);
		});

		it('returns 404 when tag does not exist on DELETE', async () => {
			const res = await deleteTag(httpRequest('DELETE', '/api/tags?id=99999'));
			expect(res.status).toBe(404);
		});

		it('deletes by id and returns message', async () => {
			const created = await createTag(httpRequest('POST', '/api/tags', { body: { name: 'ToGo' } }));
			expect(created.status).toBe(201);
			const { id } = await created.json();
			const res = await deleteTag(httpRequest('DELETE', `/api/tags?id=${id}`));
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body.message).toBe('Tag deleted successfully');
			const remaining = await db.select().from(tags);
			expect(remaining).toHaveLength(0);
		});

		it('returns 404 for non-numeric id query on DELETE', async () => {
			const res = await deleteTag(httpRequest('DELETE', '/api/tags?id=abc'));
			expect(res.status).toBe(404);
		});
	});

	describe('/api/content', () => {
		it('GET list returns an empty array when there is no content', async () => {
			const url = listContentUrl();
			const res = await listContent(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			await expect(res.json()).resolves.toEqual([]);
		});

		it('GET list returns items with tags and categoryName', async () => {
			const suffix = crypto.randomUUID().slice(0, 8);
			const [cat] = await db
				.insert(categories)
				.values({ name: 'Cat', slug: `cat-${suffix}`, description: null })
				.returning();
			const [tag] = await db
				.insert(tags)
				.values({ name: `T1-${suffix}`, slug: `t1-${suffix}` })
				.returning();
			const createRes = await createContent(
				httpRequest('POST', '/api/content', {
					body: {
						title: 'Title A',
						summary: 'Summary A',
						categoryId: cat.id,
						tagIds: [tag.id],
						isPublished: true
					}
				})
			);
			expect(createRes.status).toBe(201);
			const created = await createRes.json();
			expect(typeof created.id).toBe('number');

			const url = listContentUrl();
			const res = await listContent(
				createRequestEvent({ url, request: new Request(url), params: {} })
			);
			expect(res.status).toBe(200);
			const body = await res.json();
			expect(body).toHaveLength(1);
			expect(body[0].title).toBe('Title A');
			expect(body[0].categoryName).toBe('Cat');
			expect(body[0].isPublished).toBe(true);
			expect(body[0].tags).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ id: tag.id, name: `T1-${suffix}`, slug: `t1-${suffix}` })
				])
			);
		});

		it('POST returns 201 with defaults and empty tags', async () => {
			const res = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'Hello World', summary: 'Some summary text here' }
				})
			);
			expect(res.status).toBe(201);
			const body = await res.json();
			expect(body.title).toBe('Hello World');
			expect(body.slug).toBe('hello-world');
			expect(body.isPublished).toBe(false);
			expect(body.tags).toEqual([]);
		});

		it('POST returns 400 when title or summary is missing', async () => {
			const res = await createContent(
				httpRequest('POST', '/api/content', { body: { title: 'Only title' } })
			);
			expect(res.status).toBe(400);
		});

		it('POST returns 400 for unknown categoryId', async () => {
			const res = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'T', summary: 'S', categoryId: 99999 }
				})
			);
			expect(res.status).toBe(400);
		});

		it('POST returns 400 for unknown tag id', async () => {
			const res = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'T', summary: 'S', tagIds: [99999] }
				})
			);
			expect(res.status).toBe(400);
		});

		it('POST returns 409 on duplicate slug', async () => {
			await withMockConsoleError(async () => {
				const body = { title: 'First', summary: 'S', slug: 'shared-slug' };
				const first = await createContent(httpRequest('POST', '/api/content', { body }));
				expect(first.status).toBe(201);
				const second = await createContent(httpRequest('POST', '/api/content', { body }));
				expect(second.status).toBe(409);
			});
		});

		it('POST returns 500 on invalid JSON', async () => {
			await withMockConsoleError(async () => {
				const url = listContentUrl();
				const request = new Request(url, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: 'not-json'
				});
				const res = await createContent(createRequestEvent({ url, request }));
				expect(res.status).toBe(500);
				const body = await res.json();
				expect(body.error).toBe('Failed to create content');
			});
		});

		it('GET by id returns 400 for non-integer id', async () => {
			const res = await getContent(contentIdEvent('GET', 'nope'));
			expect(res.status).toBe(400);
		});

		it('GET by id returns 404 when missing', async () => {
			const res = await getContent(contentIdEvent('GET', '1'));
			expect(res.status).toBe(404);
		});

		it('GET by id returns item with tags', async () => {
			const suffix = crypto.randomUUID().slice(0, 8);
			const [tag] = await db
				.insert(tags)
				.values({ name: `X-${suffix}`, slug: `x-${suffix}` })
				.returning();
			const created = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'Single', summary: 'Body', tagIds: [tag.id] }
				})
			);
			const { id } = await created.json();
			const res = await getContent(contentIdEvent('GET', String(id)));
			expect(res.status).toBe(200);
			const row = await res.json();
			expect(row.tags).toEqual(expect.arrayContaining([expect.objectContaining({ id: tag.id })]));
		});

		it('PATCH returns 404 when missing', async () => {
			const res = await patchContent(contentIdEvent('PATCH', '1', { title: 'N' }));
			expect(res.status).toBe(404);
		});

		it('PATCH returns 400 for empty title', async () => {
			const created = await createContent(
				httpRequest('POST', '/api/content', { body: { title: 'T', summary: 'S' } })
			);
			const { id } = await created.json();
			const res = await patchContent(contentIdEvent('PATCH', String(id), { title: '   ' }));
			expect(res.status).toBe(400);
		});

		it('PATCH returns 400 for invalid slug', async () => {
			const created = await createContent(
				httpRequest('POST', '/api/content', { body: { title: 'T', summary: 'S' } })
			);
			const { id } = await created.json();
			const res = await patchContent(contentIdEvent('PATCH', String(id), { slug: '@@@' }));
			expect(res.status).toBe(400);
		});

		it('PATCH returns 409 when slug collides', async () => {
			await withMockConsoleError(async () => {
				await createContent(
					httpRequest('POST', '/api/content', { body: { title: 'A', summary: 'S', slug: 'slug-a' } })
				);
				const second = await createContent(
					httpRequest('POST', '/api/content', { body: { title: 'B', summary: 'S', slug: 'slug-b' } })
				);
				const { id } = await second.json();
				const res = await patchContent(contentIdEvent('PATCH', String(id), { slug: 'slug-a' }));
				expect(res.status).toBe(409);
			});
		});

		it('PATCH replaces tagIds', async () => {
			const suffix = crypto.randomUUID().slice(0, 8);
			const [t1] = await db
				.insert(tags)
				.values({ name: `a-${suffix}`, slug: `a-${suffix}` })
				.returning();
			const [t2] = await db
				.insert(tags)
				.values({ name: `b-${suffix}`, slug: `b-${suffix}` })
				.returning();
			const created = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'T', summary: 'S', tagIds: [t1.id] }
				})
			);
			const { id } = await created.json();
			const res = await patchContent(contentIdEvent('PATCH', String(id), { tagIds: [t2.id] }));
			expect(res.status).toBe(200);
			const row = await res.json();
			expect(row.tags.map((t: { id: number }) => t.id)).toEqual([t2.id]);
			const junctions = await db.select().from(contentTags).where(eq(contentTags.contentId, id));
			expect(junctions.map((j) => j.tagId)).toEqual([t2.id]);
		});

		it('PATCH clears tags with empty array', async () => {
			const suffix = crypto.randomUUID().slice(0, 8);
			const [tag] = await db
				.insert(tags)
				.values({ name: `clear-${suffix}`, slug: `clear-${suffix}` })
				.returning();
			const created = await createContent(
				httpRequest('POST', '/api/content', {
					body: { title: 'T', summary: 'S', tagIds: [tag.id] }
				})
			);
			const { id } = await created.json();
			const res = await patchContent(contentIdEvent('PATCH', String(id), { tagIds: [] }));
			expect(res.status).toBe(200);
			const row = await res.json();
			expect(row.tags).toEqual([]);
			const junctions = await db.select().from(contentTags).where(eq(contentTags.contentId, id));
			expect(junctions).toHaveLength(0);
		});

		it('PATCH returns 500 on invalid JSON', async () => {
			await withMockConsoleError(async () => {
				const created = await createContent(
					httpRequest('POST', '/api/content', { body: { title: 'T', summary: 'S' } })
				);
				const { id } = await created.json();
				const url = new URL(`https://example.com/api/content/${id}`);
				const request = new Request(url, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: '{'
				});
				const res = await patchContent(
					createRequestEvent({ url, request, params: { id: String(id) } })
				);
				expect(res.status).toBe(500);
				const body = await res.json();
				expect(body.error).toBe('Failed to update content');
			});
		});

		it('DELETE returns 400 for invalid id', async () => {
			const res = await deleteContent(contentIdEvent('DELETE', 'bad'));
			expect(res.status).toBe(400);
		});

		it('DELETE returns 404 when missing', async () => {
			const res = await deleteContent(contentIdEvent('DELETE', '1'));
			expect(res.status).toBe(404);
		});

		it('DELETE removes item and GET returns 404', async () => {
			const created = await createContent(
				httpRequest('POST', '/api/content', { body: { title: 'Del', summary: 'S' } })
			);
			const { id } = await created.json();
			const del = await deleteContent(contentIdEvent('DELETE', String(id)));
			expect(del.status).toBe(200);
			const get = await getContent(contentIdEvent('GET', String(id)));
			expect(get.status).toBe(404);
		});
	});

	it('runs with Vitest mode set to test', () => {
		expect(import.meta.env.MODE).toBe('test');
	});
});
