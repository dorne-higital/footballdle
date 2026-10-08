import { defineConfig } from 'vitest/config'

// Unit tests for plain TypeScript logic (no Nuxt runtime): yarn test
export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
	},
})
