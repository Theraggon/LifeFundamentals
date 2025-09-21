<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let newTagName = '';
	let isCreating = false;
	let error = '';
	let success = '';

	async function createTag() {
		if (!newTagName.trim()) {
			error = 'Please enter a tag name';
			return;
		}

		isCreating = true;
		error = '';
		success = '';

		try {
			const response = await fetch('/api/tags', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name: newTagName.trim() })
			});

			const result = await response.json();

			if (response.ok) {
				success = `Tag "${result.name}" created successfully!`;
				newTagName = '';
				// Refresh the page data
				await invalidateAll();
			} else {
				error = result.error || 'Failed to create tag';
			}
		} catch (err) {
			error = 'Failed to create tag. Please try again.';
			console.error('Error creating tag:', err);
		} finally {
			isCreating = false;
		}
	}

	async function deleteTag(id: number, name: string) {
		if (!confirm(`Are you sure you want to delete the tag "${name}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/tags?id=${id}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (response.ok) {
				success = `Tag "${name}" deleted successfully!`;
				error = '';
				// Refresh the page data
				await invalidateAll();
			} else {
				error = result.error || 'Failed to delete tag';
			}
		} catch (err) {
			error = 'Failed to delete tag. Please try again.';
			console.error('Error deleting tag:', err);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			createTag();
		}
	}
</script>

<svelte:head>
	<title>Manage Tags - LifeFundamentals Admin</title>
</svelte:head>

<div class="container mx-auto px-4 py-8"> 
	<h1 class="text-3xl font-bold mb-8">Manage Tags</h1>

	<!-- Create new tag form -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-8">
		<h2 class="text-xl font-semibold mb-4">Create New Tag</h2>
		
		<div class="flex gap-4 items-end">
			<div class="flex-1">
				<label for="tagName" class="block text-sm font-medium text-gray-700 mb-2">
					Tag Name
				</label>
				<input
					type="text"
					id="tagName"
					bind:value={newTagName}
					on:keydown={handleKeydown}
					placeholder="Enter tag name"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					disabled={isCreating}
				/>
			</div>
			sadasds
			<button
				on:click={createTag}
				disabled={isCreating || !newTagName.trim()}
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isCreating ? 'Creating...' : 'Create Tag'}
			</button>
		</div>

		<!-- Success/Error messages -->
		{#if success}
			<div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
				<p class="text-green-800">{success}</p>
			</div>
		{/if}

		{#if error}
			<div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
				<p class="text-red-800">{error}</p>
			</div>
		{/if}
	</div>

	<!-- Existing tags list -->
	<div class="bg-white rounded-lg shadow-md p-6">
		<h2 class="text-xl font-semibold mb-4">Existing Tags ({data.tags.length})</h2>
		
		{#if data.tags.length === 0}
			<p class="text-gray-500 italic">No tags created yet. Create your first tag above!</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								ID
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Name
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Slug
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="bg-white divide-y divide-gray-200">
						{#each data.tags as tag}
							<tr>
								<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{tag.id}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{tag.name}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{tag.slug}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<button
										on:click={() => deleteTag(tag.id, tag.name)}
										class="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
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
	/* Add some custom styling if needed */
	.container {
		max-width: 1200px;
	}
</style>
