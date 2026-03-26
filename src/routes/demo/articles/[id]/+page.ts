import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const res = await fetch(`/api/content/${params.id}`);

	if (!res.ok) {
		error(404, 'Article not found');
	}

	const article = await res.json();

	if (!article.isPublished) {
		error(404, 'Article not found');
	}

	return { article };
};
