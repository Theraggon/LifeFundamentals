import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/content');
	const data = await res.json();

	if (!res.ok || !Array.isArray(data)) {
		return { articles: [] as unknown[] };
	}

	const articles = data.filter(
		(a: { isPublished?: boolean }) => a.isPublished === true
	);

	return { articles };
};
