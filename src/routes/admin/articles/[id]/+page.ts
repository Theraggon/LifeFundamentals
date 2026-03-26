import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [articleRes, categoriesRes, tagsRes] = await Promise.all([
		fetch(`/api/content/${params.id}`),
		fetch('/api/categories'),
		fetch('/api/tags')
	]);

	if (!articleRes.ok) {
		error(articleRes.status === 404 ? 404 : 500, 'Article not found');
	}

	const article = await articleRes.json();
	const categories = categoriesRes.ok ? await categoriesRes.json() : [];
	const tags = tagsRes.ok ? await tagsRes.json() : [];

	return { article, categories, tags };
};
