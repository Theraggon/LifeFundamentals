import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// GET all tags
export const GET: RequestHandler = async () => {
	try {
		const allTags = await db.select().from(tags);
		return json(allTags);
	} catch (error) {
		console.error('Error fetching tags:', error);
		return json({ error: 'Failed to fetch tags' }, { status: 500 });
	}
};

// POST create new tag
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name } = await request.json();
		
		if (!name || typeof name !== 'string') {
			return json({ error: 'Tag name is required' }, { status: 400 });
		}

		// Create slug from name (lowercase, replace spaces with hyphens)
		const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
		
		const newTag = await db.insert(tags).values({
			name: name.trim(),
			slug
		}).returning();

		return json(newTag[0], { status: 201 });
	} catch (error) {
		console.error('Error creating tag:', error);
		if (error instanceof Error && 'code' in error && error.code === '23505') { // Unique constraint violation
			return json({ error: 'A tag with this name or slug already exists' }, { status: 409 });
		}
		return json({ error: 'Failed to create tag' }, { status: 500 });
	}
};

// DELETE tag
export const DELETE: RequestHandler = async ({ request, url }) => {
	try {
		const id = url.searchParams.get('id');
		
		if (!id) {
			return json({ error: 'Tag ID is required' }, { status: 400 });
		}

		const deletedTag = await db.delete(tags).where(eq(tags.id, parseInt(id))).returning();
		
		if (deletedTag.length === 0) {
			return json({ error: 'Tag not found' }, { status: 404 });
		}

		return json({ message: 'Tag deleted successfully' });
	} catch (error) {
		console.error('Error deleting tag:', error);
		return json({ error: 'Failed to delete tag' }, { status: 500 });
	}
};
