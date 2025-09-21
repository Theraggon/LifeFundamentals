<script lang="ts">
	import '../../app.css';
	import { page } from '$app/stores';

	export const prerender = false;
	export const ssr = false;

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-100">
	<!-- Admin Header -->
	<header class="bg-white shadow-sm">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center py-6">
				<div class="flex items-center">
					<h1 class="text-2xl font-bold text-gray-900">LifeFundamentals Admin</h1>
				</div>
				<nav class="flex space-x-8">
					<a 
						href="/admin" 
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
						class:text-blue-600={$page.url.pathname === '/admin'}
						class:bg-blue-50={$page.url.pathname === '/admin'}
					>
						Dashboard
					</a>
					<a 
						href="/admin/tags" 
						class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
						class:text-blue-600={$page.url.pathname === '/admin/tags'}
						class:bg-blue-50={$page.url.pathname === '/admin/tags'}
					>
						Tags
					</a>
				</nav>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		{@render children()}
	</main>
</div>
