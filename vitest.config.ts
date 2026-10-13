import { defineConfig } from 'vitest/config'

// Plain unit tests for pure game logic (no Nuxt runtime needed)
export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
	},
})
