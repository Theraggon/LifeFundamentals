<script lang="ts">
	import type { Article } from '$lib/types/article';

	let { article }: { article: Article } = $props();

	function formatDate(value: string | Date) {
		const d = typeof value === 'string' ? new Date(value) : value;
		return d.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<article class="mx-auto max-w-3xl">
	<header class="mb-8 border-b border-gray-200 pb-6">
		{#if article.categoryName}
			<p class="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
				{article.categoryName}
			</p>
		{/if}
		<h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
			{article.title}
		</h1>
		<p class="mt-3 text-sm text-gray-500">
			Updated {formatDate(article.updatedAt)}
		</p>
		{#if article.tags.length > 0}
			<ul class="mt-4 flex flex-wrap gap-2">
				{#each article.tags as tag}
					<li>
						<span
							class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
						>
							{tag.name}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</header>

	<div class="prose prose-gray max-w-none prose-p:text-gray-700">
		<p class="whitespace-pre-wrap leading-relaxed">{article.summary}</p>
	</div>

	{#if article.sourceUrl}
		<footer class="mt-10 border-t border-gray-100 pt-6">
			<a
				href={article.sourceUrl}
				class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				View source
			</a>
		</footer>
	{/if}
</article>
