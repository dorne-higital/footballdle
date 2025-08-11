<template>
	<div class="login-page">
		<!-- Loading Overlay -->
		<div v-if="isLoading" class="loading-overlay">
			<div class="loading-content">
				<Loader variant="dots" text="Checking authentication..." />
			</div>
		</div>
		<div class="login-container">
			<div class="login-header">
				<h1 class="heading">Welcome to Footballdle</h1>
				<p class="subtitle">Sign in to save your stats and play across devices</p>
			</div>

			<!-- Loading State -->
			<div v-if="authStore.isLoading" class="loading-state">
				<Loader variant="dots" text="Loading..." />
			</div>

			<!-- Auth Forms -->
			<div v-else class="auth-content">
				<!-- Guest Mode Option -->
				<div class="guest-section">
					<h3>Play as Guest</h3>
					<p class="caption">Play without saving stats</p>
					<button @click="handleGuestMode" class="button secondary full">
						Continue as Guest
					</button>
				</div>

				<div class="divider">
					<span>or</span>
				</div>

				<!-- Login/Signup Toggle -->
				<div class="auth-toggle">
					<button 
						:class="['toggle-btn', { active: authMode === 'login' }]"
						@click="authMode = 'login'"
					>
						Sign In
					</button>
					<button 
						:class="['toggle-btn', { active: authMode === 'signup' }]"
						@click="authMode = 'signup'"
					>
						Sign Up
					</button>
				</div>

				<!-- Error Display -->
				<div v-if="authStore.error" class="error-message">
					{{ authStore.error }}
				</div>

				<!-- Login Form -->
				<form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
					<div class="form-group">
						<label for="login-email">Email</label>
						<input 
							id="login-email"
							v-model="loginForm.email"
							type="email"
							required
							placeholder="Enter your email"
						/>
					</div>
					<div class="form-group">
						<label for="login-password">Password</label>
						<input 
							id="login-password"
							v-model="loginForm.password"
							type="password"
							required
							placeholder="Enter your password"
						/>
					</div>
					<button type="submit" class="button primary full" :disabled="isSubmitting">
						{{ isSubmitting ? 'Signing In...' : 'Sign In' }}
					</button>
				</form>

				<!-- Signup Form -->
				<form v-if="authMode === 'signup'" @submit.prevent="handleSignup" class="auth-form">
					<div class="form-group">
						<label for="signup-name">Display Name</label>
						<input 
							id="signup-name"
							v-model="signupForm.displayName"
							type="text"
							required
							placeholder="Enter your name"
						/>
					</div>
					<div class="form-group">
						<label for="signup-email">Email</label>
						<input 
							id="signup-email"
							v-model="signupForm.email"
							type="email"
							required
							placeholder="Enter your email"
						/>
					</div>
					<div class="form-group">
						<label for="signup-password">Password</label>
						<input 
							id="signup-password"
							v-model="signupForm.password"
							type="password"
							required
							minlength="6"
							placeholder="Enter your password (min 6 characters)"
						/>
					</div>
					<button type="submit" class="button primary full" :disabled="isSubmitting">
						{{ isSubmitting ? 'Creating Account...' : 'Create Account' }}
					</button>
				</form>

				<!-- Social Login -->
				<div class="social-login">
					<div class="divider">
						<span>or</span>
					</div>
					<button @click="handleGoogleLogin" class="button google full" :disabled="isSubmitting">
						<Icon name="logos:google-icon" size="1.2rem" />
						Continue with Google
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useFirestore } from '../composables/useFirestore'
import { doc, setDoc } from 'firebase/firestore'
import { useNuxtApp } from 'nuxt/app'
import { useAnalytics } from '../composables/useAnalytics'

const authStore = useAuthStore()
const { createUserProfile } = useFirestore()
const { trackSignup, trackLogin, trackPageView } = useAnalytics()

// Form state
const authMode = ref<'login' | 'signup'>('login')
const isSubmitting = ref(false)
const isLoading = ref(true)

const loginForm = reactive({
	email: '',
	password: ''
})

const signupForm = reactive({
	displayName: '',
	email: '',
	password: ''
})

// Redirect if already authenticated (but allow guests to access login page)
onMounted(() => {
	// Track page view
	trackPageView('login')
	
	// Wait for auth to initialize
	setTimeout(() => {
		isLoading.value = false
		// Only redirect if user is authenticated (not guest)
		if (authStore.isAuthenticated) {
			window.location.href = '/'
		}
	}, 1000)
})

// Watch for authentication and redirect (but not for guest mode changes)
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
	if (isAuthenticated) {

		window.location.href = '/'
	}
}, { immediate: true })

// Also watch for initialization to handle cases where user is already authenticated
watch(() => authStore.isInitialized, (isInitialized) => {
	if (isInitialized) {
		isLoading.value = false
		// Only redirect if user is authenticated (not guest)
		if (authStore.isAuthenticated) {
	
			window.location.href = '/'
		}
	}
}, { immediate: true })



// ============================================================================
// EVENT HANDLERS
// ============================================================================
async function handleLogin() {
	try {
		isSubmitting.value = true
		const user = await authStore.signInWithEmail(loginForm.email, loginForm.password)
		
		// Track login
		trackLogin('email')
		
		// Check if user profile exists in Firestore, create if missing
		if (user) {
			try {
				const { getUserProfile, createUserProfile } = useFirestore()
				const existingProfile = await getUserProfile(user.uid)
				
				if (!existingProfile) {
					await createUserProfile(user.uid, {
						displayName: user.email || loginForm.email,
						email: user.email || loginForm.email,
					})
				}
			} catch (error) {
				// Silent fail
			}
		}
		
		// Force redirect after successful login
		setTimeout(() => {
			window.location.href = '/'
		}, 500)
	} catch (error) {
		console.error('Login error:', error)
	} finally {
		isSubmitting.value = false
	}
}

async function handleSignup() {
	try {
		isSubmitting.value = true
		
		const user = await authStore.signUpWithEmail(
			signupForm.email, 
			signupForm.password, 
			signupForm.displayName
		)
		
		// Track signup
		trackSignup('email')
		
		// Create user profile in Firestore - BULLETPROOF APPROACH
		if (user) {
			// Force profile creation with multiple attempts
			let success = false
			
			// Attempt 1: Immediate
			try {
				const { createUserProfile } = useFirestore()
				await createUserProfile(user.uid, {
					displayName: signupForm.email,
					email: signupForm.email,
				})
				success = true
			} catch (error) {
				// Continue to next attempt
			}
			
			// Attempt 2: After delay
			if (!success) {
				await new Promise(resolve => setTimeout(resolve, 3000))
				try {
					const { createUserProfile } = useFirestore()
					await createUserProfile(user.uid, {
						displayName: signupForm.email,
						email: signupForm.email,
					})
					success = true
				} catch (error) {
					// Continue to next attempt
				}
			}
			
			// Attempt 3: Direct Firestore write
			if (!success) {
				try {
					const nuxtApp = useNuxtApp()
					const { db } = nuxtApp.$firebase as any
					const userRef = doc(db, 'users', user.uid)
					await setDoc(userRef, {
						displayName: signupForm.email,
						email: signupForm.email,
						createdAt: new Date(),
						lastLogin: new Date(),
					})
					success = true
				} catch (error) {
					// Final attempt failed
				}
			}
		}
		
		// Force redirect after successful signup
		setTimeout(() => {
			window.location.href = '/'
		}, 500)
	} catch (error) {
		console.error('Signup error:', error)
		throw error // Re-throw to show error to user
	} finally {
		isSubmitting.value = false
	}
}

async function handleGoogleLogin() {
	try {
		isSubmitting.value = true
		const user = await authStore.signInWithGoogle()
		
		// Track Google login/signup
		trackLogin('google')
		
		// Create user profile if it doesn't exist
		if (user) {
			await createUserProfile(user.uid, {
				displayName: user.displayName,
				email: user.email,
			})
		}
		
		// Force a redirect after a short delay to ensure state is updated
		setTimeout(() => {
			window.location.href = '/'
		}, 500)
		
	} catch (error) {
		console.error('Google login error:', error)
	} finally {
		isSubmitting.value = false
	}
}

function handleGuestMode() {
	authStore.enableGuestMode()
	
	// Track guest mode
	trackSignup('guest')
	
	// Wait a bit longer to ensure state is properly set
	setTimeout(() => {
		window.location.href = '/'
	}, 1000)
}
</script>

<style scoped lang="scss">
.login-page {
	min-height: 100vh;
	background: var(--bg-gradient);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 1.5rem;
	position: relative;
	overflow-x: hidden;
	
	/* Enhanced background with subtle pattern */
	&::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: 
			radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.08) 0%, transparent 50%);
		pointer-events: none;
		z-index: -1;
	}
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================
.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: var(--bg-gradient);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;

	.loading-content {
		text-align: center;
		color: var(--text-primary);
		
		p {
			margin-top: 1rem;
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}
}

.login-container {
	background: var(--card-bg);
	backdrop-filter: blur(10px);
	border-radius: var(--global-border-radius);
	box-shadow: var(--card-shadow);
	border: 1px solid var(--card-border);
	padding: 2.5rem;
	max-width: 500px;
	width: 100%;
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--color-gradient);
	}
}

.login-header {
	text-align: center;
	margin-bottom: 2rem;

	.heading {
		font-size: 2.5rem;
		font-weight: 800;
		background: var(--color-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: 0.5rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.02em;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 1rem;
	}
}

.loading-state {
	text-align: center;
	padding: 2rem;
	
	p {
		margin-top: 1rem;
		color: var(--text-secondary);
	}
}

.auth-content {
	.guest-section {
		text-align: center;
		margin-bottom: 1.5rem;
		
		h3 {
			margin-bottom: 0.5rem;
			color: var(--text-primary);
		}
		
		.caption {
			margin-bottom: 1rem;
			color: var(--text-secondary);
		}
	}
	
	.divider {
		position: relative;
		text-align: center;
		margin: 1.5rem 0;
		
		&::before {
			content: '';
			position: absolute;
			top: 50%;
			left: 0;
			right: 0;
			height: 1px;
			background: var(--border);
		}
		
		span {
			background: var(--bg-secondary);
			padding: 0 1rem;
			color: var(--text-secondary);
			font-size: 0.9rem;
		}
	}
	
	.auth-toggle {
		display: flex;
		background: var(--bg-primary);
		border: 1px solid var(--border);
		border-radius: var(--global-border-radius);
		padding: 0.25rem;
		margin-bottom: 1.5rem;
		
		.toggle-btn {
			flex: 1;
			padding: 0.75rem 1rem;
			background: transparent;
			border: none;
			border-radius: calc(var(--global-border-radius) - 2px);
			color: var(--text-secondary);
			cursor: pointer;
			transition: all 0.3s ease;
			font-weight: 500;
			
			&:hover {
				color: var(--text-primary);
			}
			
			&.active {
				background: var(--primary-color);
				color: white;
			}
		}
	}
	
	.error-message {
		background: #fee2e2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: var(--global-border-radius);
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}
	
	.auth-form {
		.form-group {
			margin-bottom: 1rem;
			
			label {
				display: block;
				margin-bottom: 0.5rem;
				color: var(--text-primary);
				font-weight: 500;
			}
			
			input {
				width: 100%;
				padding: 0.75rem;
				border: 1px solid var(--border);
				border-radius: var(--global-border-radius);
				background: var(--bg-primary);
				color: var(--text-primary);
				font-size: 1rem;
				
				&:focus {
					outline: none;
					border-color: var(--primary-color);
				}
				
				&::placeholder {
					color: var(--text-secondary);
				}
			}
		}
	}
	
	.social-login {
		margin-top: 1.5rem;
		
		.google {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			background: #4285f4;
			border-color: #4285f4;
			
			&:hover {
				background: #3367d6;
				border-color: #3367d6;
			}
		}
	}
}
</style> 