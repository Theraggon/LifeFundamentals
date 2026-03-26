<script lang="ts">
	import ArticleDisplay from '$lib/components/ArticleDisplay.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.article.title} — LifeFundamentals</title>
</svelte:head>

<div class="px-4 py-10">
	<p class="mx-auto mb-8 max-w-3xl text-sm text-gray-500">
		<a href="/demo/articles" class="text-blue-600 hover:underline">← All articles</a>
	</p>

	<ArticleDisplay article={data.article} />
</div>
