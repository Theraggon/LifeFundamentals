import { pgTable, serial, integer, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	slug: varchar('slug', { length: 100 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const content = pgTable('content', {
	id: serial('id').primaryKey(),
	title: varchar('title', { length: 255 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	summary: text('summary').notNull(),
	sourceUrl: text('source_url'),
	categoryId: integer('category_id').references(() => categories.id),
	isPublished: boolean('is_published').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const tags = pgTable('tags', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	slug: varchar('slug', { length: 50 }).notNull().unique()
});

export const contentTags = pgTable('content_tags', {
	id: serial('id').primaryKey(),
	contentId: integer('content_id').references(() => content.id).notNull(),
	tagId: integer('tag_id').references(() => tags.id).notNull()
});
