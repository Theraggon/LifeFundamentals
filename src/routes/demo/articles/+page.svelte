<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	type Row = {
		id: number;
		title: string;
		slug: string;
		summary: string;
		updatedAt: string | Date;
		categoryName: string | null;
	};

	function formatDate(value: string | Date) {
		const d = typeof value === 'string' ? new Date(value) : value;
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Articles demo — LifeFundamentals</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<p class="mb-6 text-sm text-gray-500">
		<a href="/demo" class="text-blue-600 hover:underline">← Demo</a>
	</p>

	<h1 class="mb-2 text-3xl font-bold text-gray-900">Published articles</h1>
	<p class="mb-8 text-gray-600">Open an article from the list below.</p>

	{#if data.articles.length === 0}
		<p class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
			No published articles yet. Add one in the admin and mark it as published.
		</p>
	{:else}
		<ul class="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
			{#each data.articles as item}
				{@const row = item as Row}
				<li>
					<a
						href="/demo/articles/{row.id}"
						class="block px-5 py-4 transition-colors hover:bg-gray-50"
					>
						<div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
							<span class="font-medium text-gray-900">{row.title}</span>
							<span class="shrink-0 text-sm text-gray-500">{formatDate(row.updatedAt)}</span>
						</div>
						{#if row.categoryName}
							<p class="mt-1 text-xs text-gray-500">{row.categoryName}</p>
						{/if}
						<p class="mt-2 line-clamp-2 text-sm text-gray-600">{row.summary}</p>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</div>
