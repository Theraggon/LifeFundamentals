export type ArticleTag = { id: number; name: string; slug: string };

export type Article = {
	id: number;
	title: string;
	slug: string;
	summary: string;
	sourceUrl: string | null;
	categoryId: number | null;
	categoryName: string | null;
	isPublished: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
	tags: ArticleTag[];
};
