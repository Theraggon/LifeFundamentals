import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch('/api/tags');
		const tags = await response.json();
		
		return {
			tags: response.ok ? tags : []
		};
	} catch (error) {
		console.error('Error loading tags:', error);
		return {
			tags: []
		};
	}
};
