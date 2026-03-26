import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const [contentRes, categoriesRes, tagsRes] = await Promise.all([
			fetch('/api/content'),
			fetch('/api/categories'),
			fetch('/api/tags')
		]);

		const articles = contentRes.ok ? await contentRes.json() : [];
		const categories = categoriesRes.ok ? await categoriesRes.json() : [];
		const tags = tagsRes.ok ? await tagsRes.json() : [];

		return { articles, categories, tags };
	} catch (error) {
		console.error('Error loading articles:', error);
		return { articles: [], categories: [], tags: [] };
	}
};
