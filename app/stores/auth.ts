import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
	signInWithEmailAndPassword, 
	createUserWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onAuthStateChanged,
	setPersistence,
	browserLocalPersistence,
	type User
} from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
	// ============================================================================
	// REACTIVE STATE
	// ============================================================================
	const user = ref<User | null>(null)
	const isGuest = ref(false)
	const isLoading = ref(true)
	const error = ref<string | null>(null)
	const isInitialized = ref(false)

	// ============================================================================
	// COMPUTED PROPERTIES
	// ============================================================================
	const isAuthenticated = computed(() => !!user.value)
	const isLoggedIn = computed(() => isAuthenticated.value && !isGuest.value)
	const displayName = computed(() => {
		if (isGuest.value) return 'Guest Player'
		return user.value?.email || 'Player'
	})

	// ============================================================================
	// AUTHENTICATION FUNCTIONS
	// ============================================================================
	async function signInWithEmail(email: string, password: string) {
		try {
			error.value = null
			const nuxtApp = useNuxtApp()
			const { auth } = nuxtApp.$firebase
			
			// Set persistence to local
			await setPersistence(auth, browserLocalPersistence)
			
			const result = await signInWithEmailAndPassword(auth, email, password)
			user.value = result.user
			isGuest.value = false
			localStorage.removeItem('footballdle-guest')
			return result.user
		} catch (err: any) {
			error.value = err.message
			console.error('Email sign in error:', err)
			throw err
		}
	}

	async function signUpWithEmail(email: string, password: string, displayName: string) {
		try {
			error.value = null
			const nuxtApp = useNuxtApp()
			const { auth } = nuxtApp.$firebase
			
			// Set persistence to local
			await setPersistence(auth, browserLocalPersistence)
			
			const result = await createUserWithEmailAndPassword(auth, email, password)
			
			// Try to update display name, but don't fail if it doesn't work
			try {
				await (result.user as any).updateProfile({ displayName })
	
			} catch (profileError: any) {
				console.warn('Could not update display name in Firebase Auth:', profileError.message)
				// Don't throw here - the user is still created successfully
				// The display name will be saved in Firestore instead
			}
			
			user.value = result.user
			isGuest.value = false
			localStorage.removeItem('footballdle-guest')
			return result.user
		} catch (err: any) {
			error.value = err.message
			console.error('Email sign up error:', err)
			throw err
		}
	}

	async function signInWithGoogle() {
		try {
			error.value = null
			const nuxtApp = useNuxtApp()
			const { auth } = nuxtApp.$firebase
			
			// Set persistence to local
			await setPersistence(auth, browserLocalPersistence)
			
			const provider = new GoogleAuthProvider()
			// Add custom parameters to avoid popup issues
			provider.setCustomParameters({
				prompt: 'select_account'
			})
			
			const result = await signInWithPopup(auth, provider)
			user.value = result.user
			isGuest.value = false
			localStorage.removeItem('footballdle-guest')
			return result.user
		} catch (err: any) {
			error.value = err.message
			console.error('Google sign in error:', err)
			throw err
		}
	}

	async function signOutUser() {
		try {
			error.value = null
			const nuxtApp = useNuxtApp()
			const { auth } = nuxtApp.$firebase
			await signOut(auth)
			user.value = null
			isGuest.value = false
			localStorage.removeItem('footballdle-guest')
		} catch (err: any) {
			error.value = err.message
			console.error('Sign out error:', err)
			throw err
		}
	}

	function enableGuestMode() {
		user.value = null
		isGuest.value = true
		error.value = null
		isLoading.value = false
		isInitialized.value = true
		
		localStorage.setItem('footballdle-guest', 'true')
	}

	function disableGuestMode() {
		isGuest.value = false
		localStorage.removeItem('footballdle-guest')
	}

	// ============================================================================
	// INITIALIZATION
	// ============================================================================
	function initializeAuth() {
		const nuxtApp = useNuxtApp()
		const { auth } = nuxtApp.$firebase
		
		const persistedGuest = localStorage.getItem('footballdle-guest')
		if (persistedGuest === 'true') {
			isGuest.value = true
			isLoading.value = false
			isInitialized.value = true
			return
		}
		
		onAuthStateChanged(auth, (firebaseUser) => {
			// Only update user state if we're not in guest mode
			if (!isGuest.value) {
				user.value = firebaseUser
				isGuest.value = false
			}
			
			// Only update loading state if we haven't already set it (for guest mode)
			if (!isInitialized.value) {
				isLoading.value = false
				isInitialized.value = true
			}
		})
	}

	// ============================================================================
	// UTILITY FUNCTIONS
	// ============================================================================
	function clearError() {
		error.value = null
	}

	return {
		// State
		user,
		isGuest,
		isLoading,
		error,
		isInitialized,
		
		// Computed
		isAuthenticated,
		isLoggedIn,
		displayName,
		
		// Functions
		signInWithEmail,
		signUpWithEmail,
		signInWithGoogle,
		signOutUser,
		enableGuestMode,
		disableGuestMode,
		initializeAuth,
		clearError,
	}
}) 