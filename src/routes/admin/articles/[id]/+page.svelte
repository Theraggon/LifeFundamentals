<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let title = '';
	let summary = '';
	let slug = '';
	let sourceUrl = '';
	let categoryId = '';
	let isPublished = false;
	let selectedTagIds: number[] = [];
	let isSaving = false;
	let error = '';
	let success = '';

	$: if (data.article) {
		title = data.article.title;
		summary = data.article.summary;
		slug = data.article.slug;
		sourceUrl = data.article.sourceUrl ?? '';
		categoryId = data.article.categoryId != null ? String(data.article.categoryId) : '';
		isPublished = data.article.isPublished;
		selectedTagIds = data.article.tags.map((t: { id: number }) => t.id);
	}

	function toggleTag(id: number) {
		if (selectedTagIds.includes(id)) {
			selectedTagIds = selectedTagIds.filter((x) => x !== id);
		} else {
			selectedTagIds = [...selectedTagIds, id];
		}
	}

	async function save() {
		if (!title.trim() || !summary.trim()) {
			error = 'Title and summary are required';
			return;
		}

		isSaving = true;
		error = '';
		success = '';

		const body: Record<string, unknown> = {
			title: title.trim(),
			summary: summary.trim(),
			slug: slug.trim(),
			isPublished,
			tagIds: selectedTagIds
		};

		body.sourceUrl = sourceUrl.trim() ? sourceUrl.trim() : null;
		if (categoryId !== '') {
			body.categoryId = parseInt(categoryId, 10);
		} else {
			body.categoryId = null;
		}

		try {
			const response = await fetch(`/api/content/${data.article.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const result = await response.json();

			if (response.ok) {
				success = 'Article saved.';
				await invalidateAll();
			} else {
				error = result.error || 'Failed to save';
			}
		} catch (err) {
			error = 'Failed to save. Please try again.';
			console.error(err);
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Edit article - LifeFundamentals Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Edit article</h1>
		<button
			type="button"
			class="text-sm text-gray-600 hover:text-gray-900"
			on:click={() => goto('/admin/articles')}
		>
			← Back to articles
		</button>
	</div>

	<div class="rounded-lg bg-white p-6 shadow-md">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="md:col-span-2">
				<label for="title" class="mb-2 block text-sm font-medium text-gray-700">Title</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isSaving}
				/>
			</div>
			<div class="md:col-span-2">
				<label for="summary" class="mb-2 block text-sm font-medium text-gray-700">Summary</label>
				<textarea
					id="summary"
					bind:value={summary}
					rows="5"
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isSaving}
				></textarea>
			</div>
			<div>
				<label for="slug" class="mb-2 block text-sm font-medium text-gray-700">Slug</label>
				<input
					id="slug"
					type="text"
					bind:value={slug}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isSaving}
				/>
			</div>
			<div>
				<label for="sourceUrl" class="mb-2 block text-sm font-medium text-gray-700"
					>Source URL</label
				>
				<input
					id="sourceUrl"
					type="url"
					bind:value={sourceUrl}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isSaving}
				/>
			</div>
			<div>
				<label for="category" class="mb-2 block text-sm font-medium text-gray-700">Category</label>
				<select
					id="category"
					bind:value={categoryId}
					class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
					disabled={isSaving}
				>
					<option value="">None</option>
					{#each data.categories as c}
						<option value={String(c.id)}>{c.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex items-end">
				<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
					<input type="checkbox" bind:checked={isPublished} disabled={isSaving} />
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
									disabled={isSaving}
								/>
								{tag.name}
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-6 flex gap-3">
			<button
				type="button"
				on:click={save}
				disabled={isSaving || !title.trim() || !summary.trim()}
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSaving ? 'Saving…' : 'Save changes'}
			</button>
			<button
				type="button"
				class="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
				on:click={() => goto('/admin/articles')}
				disabled={isSaving}
			>
				Cancel
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
</div>

<style>
	.container {
		max-width: 1200px;
	}
</style>
