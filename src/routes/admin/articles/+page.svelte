<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let newTitle = '';
	let newSummary = '';
	let newSlug = '';
	let newSourceUrl = '';
	let newCategoryId = '';
	let newIsPublished = false;
	let selectedTagIds: number[] = [];
	let isCreating = false;
	let error = '';
	let success = '';

	function toggleTag(id: number) {
		if (selectedTagIds.includes(id)) {
			selectedTagIds = selectedTagIds.filter((x) => x !== id);
		} else {
			selectedTagIds = [...selectedTagIds, id];
		}
	}

	async function createArticle() {
		if (!newTitle.trim() || !newSummary.trim()) {
			error = 'Title and summary are required';
			return;
		}

		isCreating = true;
		error = '';
		success = '';

		const body: Record<string, unknown> = {
			title: newTitle.trim(),
			summary: newSummary.trim(),
			isPublished: newIsPublished,
			tagIds: selectedTagIds
		};

		if (newSlug.trim()) {
			body.slug = newSlug.trim();
		}
		if (newSourceUrl.trim()) {
			body.sourceUrl = newSourceUrl.trim();
		}
		if (newCategoryId !== '') {
			body.categoryId = parseInt(newCategoryId, 10);
		}

		try {
			const response = await fetch('/api/content', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const result = await response.json();

			if (response.ok) {
				success = `Article "${result.title}" created successfully!`;
				newTitle = '';
				newSummary = '';
				newSlug = '';
				newSourceUrl = '';
				newCategoryId = '';
				newIsPublished = false;
				selectedTagIds = [];
				await invalidateAll();
			} else {
				error = result.error || 'Failed to create article';
			}
		} catch (err) {
			error = 'Failed to create article. Please try again.';
			console.error(err);
		} finally {
			isCreating = false;
		}
	}

	async function deleteArticle(id: number, title: string) {
		if (!confirm(`Are you sure you want to delete "${title}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/content/${id}`, { method: 'DELETE' });
			const result = await response.json();

			if (response.ok) {
				success = `Article "${title}" deleted successfully!`;
				error = '';
				await invalidateAll();
			} else {
				error = result.error || 'Failed to delete article';
			}
		} catch (err) {
			error = 'Failed to delete article. Please try again.';
			console.error(err);
		}
	}

	function formatDate(value: string | Date) {
		const d = typeof value === 'string' ? new Date(value) : value;
		return d.toLocaleString();
	}
</script>

<svelte:head>
	<title>Articles - LifeFundamentals Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Articles</h1>

	<div class="mb-8 rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold">Create article</h2>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="md:col-span-2">
				<label for="title" class="mb-2 block text-sm font-medium text-gray-700">Title</label>
				<input
					id="title"
					type="text"
					bind:value={newTitle}
					placeholder="Title"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isCreating}
				/>
			</div>
			<div class="md:col-span-2">
				<label for="summary" class="mb-2 block text-sm font-medium text-gray-700">Summary</label>
				<textarea
					id="summary"
					bind:value={newSummary}
					rows="3"
					placeholder="Summary"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isCreating}
				></textarea>
			</div>
			<div>
				<label for="slug" class="mb-2 block text-sm font-medium text-gray-700"
					>Slug (optional)</label
				>
				<input
					id="slug"
					type="text"
					bind:value={newSlug}
					placeholder="Auto from title if empty"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isCreating}
				/>
			</div>
			<div>
				<label for="sourceUrl" class="mb-2 block text-sm font-medium text-gray-700"
					>Source URL</label
				>
				<input
					id="sourceUrl"
					type="url"
					bind:value={newSourceUrl}
					placeholder="https://"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isCreating}
				/>
			</div>
			<div>
				<label for="category" class="mb-2 block text-sm font-medium text-gray-700">Category</label>
				<select
					id="category"
					bind:value={newCategoryId}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isCreating}
				>
					<option value="">None</option>
					{#each data.categories as c}
						<option value={String(c.id)}>{c.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end">
				<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
					<input type="checkbox" bind:checked={newIsPublished} disabled={isCreating} />
					Published
				</label>
			</div>
			{#if data.tags.length > 0}
				<div class="md:col-span-2">
					<span class="mb-2 block text-sm font-medium text-gray-700">Tags</span>
					<div class="flex flex-wrap gap-3">
						{#each data.tags as tag}
							<label class="flex items-center gap-2 text-sm text-gray-800">
								<input
									type="checkbox"
									checked={selectedTagIds.includes(tag.id)}
									on:change={() => toggleTag(tag.id)}
									disabled={isCreating}
								/>
								{tag.name}
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-4">
			<button
				type="button"
				on:click={createArticle}
				disabled={isCreating || !newTitle.trim() || !newSummary.trim()}
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isCreating ? 'Creating…' : 'Create article'}
			</button>
		</div>

		{#if success}
			<div class="mt-4 rounded-md border border-green-200 bg-green-50 p-4">
				<p class="text-green-800">{success}</p>
			</div>
		{/if}

		{#if error}
			<div class="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
				<p class="text-red-800">{error}</p>
			</div>
		{/if}
	</div>

	<div class="rounded-lg bg-white p-6 shadow-md">
		<h2 class="mb-4 text-xl font-semibold">All articles ({data.articles.length})</h2>

		{#if data.articles.length === 0}
			<p class="italic text-gray-500">No articles yet. Create one above.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th
								class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Title</th
							>
							<th
								class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Slug</th
							>
							<th
								class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Category</th
							>
							<th
								class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Status</th
							>
							<th
								class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>Updated</th
							>
							<th
								class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each data.articles as article}
							<tr>
								<td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
									{article.title}
								</td>
								<td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{article.slug}</td>
								<td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
									{article.categoryName ?? '—'}
								</td>
								<td class="whitespace-nowrap px-4 py-3 text-sm">
									{#if article.isPublished}
										<span
											class="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
											>Published</span
										>
									{:else}
										<span
											class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
											>Draft</span
										>
									{/if}
								</td>
								<td class="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
									{formatDate(article.updatedAt)}
								</td>
								<td class="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
									<a href="/admin/articles/{article.id}" class="text-blue-600 hover:text-blue-800"
										>Edit</a
									>
									<span class="mx-2 text-gray-300">|</span>
									<button
										type="button"
										class="text-red-600 hover:text-red-900 focus:underline focus:outline-none"
										on:click={() => deleteArticle(article.id, article.title)}
									>
										Delete
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>
