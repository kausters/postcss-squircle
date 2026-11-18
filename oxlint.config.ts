import { defineConfig } from 'oxlint';

export default defineConfig({
	plugins: ['eslint', 'oxc', 'typescript', 'unicorn', 'vitest'],
	categories: {
		correctness: 'error',
	},
	rules: {
		'typescript/no-explicit-any': 'error',
	},
	options: {
		typeAware: true,
	},
});
