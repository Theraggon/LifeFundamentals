import { paraglideVitePlugin } from '@inlang/paraglide-js';
import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const loaded = loadEnv(mode, process.cwd(), '');
	for (const [key, value] of Object.entries(loaded)) {
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}

	return {
		plugins: [
			tailwindcss(),
			sveltekit(),
			devtoolsJson(),
			paraglideVitePlugin({
				project: './project.inlang',
				outdir: './src/lib/paraglide'
			})
		],
		test: {
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'client',
						environment: 'browser',
						browser: {
							enabled: true,
							provider: 'playwright',
							instances: [{ browser: 'chromium' }]
						},
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						maxWorkers: 1,
						minWorkers: 1,
						fileParallelism: false,
						sequence: { concurrent: false },
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						setupFiles: ['./vitest-setup-server.ts']
					}
				}
			]
		}
	};
});
