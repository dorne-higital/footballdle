<template>
	<BaseModal
		:show="show"
		heading="Welcome to Footballdle"
		variant="small"
		@close="$emit('close')"
	>
		<template #body>
			<div class="auth-container">
				<!-- Loading State -->
				<div v-if="authStore.isLoading" class="loading-state">
					<Loader />
					<p>Loading...</p>
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
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useFirestore } from '../composables/useFirestore'

const props = defineProps<{
	show: boolean
}>()

const emit = defineEmits<{
	close: []
	success: []
}>()

const authStore = useAuthStore()
const { createUserProfile } = useFirestore()

// Form state
const authMode = ref<'login' | 'signup'>('login')
const isSubmitting = ref(false)

const loginForm = reactive({
	email: '',
	password: ''
})

const signupForm = reactive({
	displayName: '',
	email: '',
	password: ''
})

// Watch for authentication state changes and close modal automatically
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
	if (isAuthenticated && props.show) {
		emit('success')
	}
}, { immediate: true })

// Watch for guest mode and close modal automatically
watch(() => authStore.isGuest, (isGuest) => {
	if (isGuest && props.show) {
		emit('success')
	}
}, { immediate: true })

// ============================================================================
// EVENT HANDLERS
// ============================================================================
async function handleLogin() {
	try {
		isSubmitting.value = true
		await authStore.signInWithEmail(loginForm.email, loginForm.password)
		emit('success')
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
		
		// Create user profile in Firestore
		if (user) {
			await createUserProfile(user.uid, {
				displayName: signupForm.displayName,
				email: signupForm.email,
			})
		}
		
		emit('success')
	} catch (error) {
		console.error('Signup error:', error)
	} finally {
		isSubmitting.value = false
	}
}

async function handleGoogleLogin() {
	try {
		isSubmitting.value = true
		const user = await authStore.signInWithGoogle()
		
		// Create user profile if it doesn't exist
		if (user) {
			await createUserProfile(user.uid, {
				displayName: user.displayName,
				email: user.email,
			})
		}
		
		emit('success')
		
		// Force a small delay to ensure auth state updates
		await new Promise(resolve => setTimeout(resolve, 100))
		
		// Double-check if we need to emit success again
		if (authStore.isAuthenticated) {
			emit('success')
		}
	} catch (error) {
		console.error('Google login error:', error)
	} finally {
		isSubmitting.value = false
	}
}

function handleGuestMode() {
	authStore.enableGuestMode()
	emit('success')
}
</script>

<style scoped lang="scss">
.auth-container {
	width: 100%;
	max-width: 400px;
	margin: 0 auto;
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