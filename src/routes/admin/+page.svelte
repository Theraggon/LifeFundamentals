<script lang="ts">
	// Admin dashboard
</script>

<svelte:head>
	<title>Admin Dashboard - LifeFundamentals</title>
</svelte:head>

<div class="px-4 py-8">
	<h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- Tags Management Card -->
		<a href="/admin/tags" class="block">
			<div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
				<div class="p-5">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
						</div>
						<div class="ml-5 w-0 flex-1">
							<dl>
								<dt class="text-sm font-medium text-gray-500 truncate">
									Tags Management
								</dt>
								<dd class="text-lg font-medium text-gray-900">
									Create & Manage Tags
								</dd>
							</dl>
						</div>
					</div>
				</div>
				<div class="bg-gray-50 px-5 py-3">
					<div class="text-sm">
						<span class="font-medium text-blue-600 hover:text-blue-500">
							Manage tags →
						</span>
					</div>
				</div>
			</div>
		</a>

		<!-- Content Management Card (placeholder for future) -->
		<div class="bg-white overflow-hidden shadow rounded-lg opacity-50">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">
								Content Management
							</dt>
							<dd class="text-lg font-medium text-gray-900">
								Coming Soon
							</dd>
						</dl>
					</div>
				</div>
			</div>
			<div class="bg-gray-50 px-5 py-3">
				<div class="text-sm">
					<span class="font-medium text-gray-400">
						Manage content →
					</span>
				</div>
			</div>
		</div>

		<!-- Categories Management Card (placeholder for future) -->
		<div class="bg-white overflow-hidden shadow rounded-lg opacity-50">
			<div class="p-5">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
						</svg>
					</div>
					<div class="ml-5 w-0 flex-1">
						<dl>
							<dt class="text-sm font-medium text-gray-500 truncate">
								Categories Management
							</dt>
							<dd class="text-lg font-medium text-gray-900">
								Coming Soon
							</dd>
						</dl>
					</div>
				</div>
			</div>
			<div class="bg-gray-50 px-5 py-3">
				<div class="text-sm">
					<span class="font-medium text-gray-400">
						Manage categories →
					</span>
				</div>
			</div>
		</div>
	</div>
</div>
