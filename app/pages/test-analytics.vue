<template>
	<div class="test-page">
		<h1>Google Analytics Test Page</h1>
		
		<div class="test-buttons">
			<button @click="testPageView" class="test-btn">
				Test Page View
			</button>
			
			<button @click="testCustomEvent" class="test-btn">
				Test Custom Event
			</button>
			
			<button @click="testGameEvent" class="test-btn">
				Test Game Event
			</button>
		</div>
		
		<div class="status">
			<p><strong>Status:</strong> {{ status }}</p>
			<p><strong>GA ID:</strong> {{ gaId || 'Not configured' }}</p>
		</div>
		
		<div class="instructions">
			<h3>How to test:</h3>
			<ol>
				<li>Click the test buttons above</li>
				<li>Open Google Analytics in another tab</li>
				<li>Go to <strong>Reports → Engagement → Events → Real-time</strong></li>
				<li>You should see events appear within seconds</li>
			</ol>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAnalytics } from '../composables/useAnalytics'

const status = ref('Checking...')
const gaId = ref('')

onMounted(() => {
	// Check if GA is configured
	const config = useRuntimeConfig()
	gaId.value = config.public.googleAnalyticsId || ''
	
	if (gaId.value) {
		status.value = 'Google Analytics configured'
	} else {
		status.value = 'Google Analytics not configured'
	}
})

const { trackGameStart, trackThemeChange, trackShare } = useAnalytics()

function testPageView() {
	status.value = 'Page view event sent'
	// Page views are automatic, but we can trigger a navigation
	window.location.reload()
}

function testCustomEvent() {
	status.value = 'Custom event sent'
	trackThemeChange('test-theme')
}

function testGameEvent() {
	status.value = 'Game event sent'
	trackGameStart()
}
</script>

<style scoped>
.test-page {
	max-width: 600px;
	margin: 2rem auto;
	padding: 2rem;
	background: var(--bg-secondary);
	border-radius: var(--global-border-radius);
	border: 1px solid var(--border);
}

.test-buttons {
	display: flex;
	gap: 1rem;
	margin: 2rem 0;
	flex-wrap: wrap;
}

.test-btn {
	padding: 0.75rem 1.5rem;
	background: var(--primary-color);
	color: white;
	border: none;
	border-radius: var(--global-border-radius);
	cursor: pointer;
	transition: all 0.3s ease;
}

.test-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status {
	background: var(--bg-primary);
	padding: 1rem;
	border-radius: var(--global-border-radius);
	margin: 1rem 0;
}

.instructions {
	background: var(--bg-primary);
	padding: 1rem;
	border-radius: var(--global-border-radius);
	margin-top: 2rem;
}

.instructions ol {
	margin: 1rem 0;
	padding-left: 1.5rem;
}

.instructions li {
	margin: 0.5rem 0;
}
</style> 