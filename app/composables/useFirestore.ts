import { 
	doc, 
	setDoc, 
	getDoc, 
	collection, 
	query, 
	where, 
	orderBy, 
	getDocs,
	updateDoc,
	increment,
	type DocumentData
} from 'firebase/firestore'

export function useFirestore() {
	// ============================================================================
	// UTILITY FUNCTIONS
	// ============================================================================
	async function testFirestoreConnection() {
		try {
			const { db } = useNuxtApp().$firebase
			
			// Try to read from a test document
			const testRef = doc(db, 'test', 'connection-test')
			await getDoc(testRef)
			return true
		} catch (error) {
			return false
		}
	}

	async function testFirestoreWrite() {
		try {
			const { db } = useNuxtApp().$firebase
			
			// Try to write to a test document
			const testRef = doc(db, 'test', 'write-test')
			await setDoc(testRef, {
				test: true,
				timestamp: new Date()
			})
			return true
		} catch (error) {
			return false
		}
	}

	// ============================================================================
	// USER PROFILE FUNCTIONS
	// ============================================================================
	async function createUserProfile(userId: string, userData: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const userRef = doc(db, 'users', userId)
			
			// Check if user profile already exists
			const existingProfile = await getDoc(userRef)
			if (existingProfile.exists()) {
				await updateUserProfile(userId, userData)
				return
			}
			
			const profileData = {
				...userData,
				createdAt: new Date(),
				lastLogin: new Date(),
			}
			
			await setDoc(userRef, profileData)
		} catch (error) {
			throw error
		}
	}

	async function updateUserProfile(userId: string, updates: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const userRef = doc(db, 'users', userId)
			await updateDoc(userRef, {
				...updates,
				lastLogin: new Date(),
			})
		} catch (error) {
			throw error
		}
	}

	async function getUserProfile(userId: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const userRef = doc(db, 'users', userId)
			const userSnap = await getDoc(userRef)
			
			if (userSnap.exists()) {
				return userSnap.data()
			}
			return null
		} catch (error) {
			throw error
		}
	}

	// ============================================================================
	// GAME STATS FUNCTIONS
	// ============================================================================
	async function saveGameStats(userId: string, stats: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const statsRef = doc(db, 'gameStats', userId)
			await setDoc(statsRef, {
				...stats,
				updatedAt: new Date(),
			})
		} catch (error) {
			throw error
		}
	}

	async function getGameStats(userId: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const statsRef = doc(db, 'gameStats', userId)
			const statsSnap = await getDoc(statsRef)
			
			if (statsSnap.exists()) {
				return statsSnap.data()
			}
			return null
		} catch (error) {
			throw error
		}
	}

	async function updateGameStats(userId: string, updates: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const statsRef = doc(db, 'gameStats', userId)
			await updateDoc(statsRef, {
				...updates,
				updatedAt: new Date(),
			})
		} catch (error) {
			console.error('Error updating game stats:', error)
			throw error
		}
	}

	// ============================================================================
	// DAILY GAME DATA FUNCTIONS
	// ============================================================================
	async function saveDailyGame(userId: string, date: string, gameData: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const gameRef = doc(db, 'dailyGames', `${userId}_${date}`)
			await setDoc(gameRef, {
				userId,
				date,
				...gameData,
				createdAt: new Date(),
			})
		} catch (error) {
			console.error('Error saving daily game:', error)
			throw error
		}
	}

	async function getDailyGame(userId: string, date: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const gameRef = doc(db, 'dailyGames', `${userId}_${date}`)
			const gameSnap = await getDoc(gameRef)
			
			if (gameSnap.exists()) {
				return gameSnap.data()
			}
			return null
		} catch (error) {
			console.error('Error getting daily game:', error)
			throw error
		}
	}

	async function getUserDailyGames(userId: string, limit = 30) {
		try {
			const { db } = useNuxtApp().$firebase
			const gamesRef = collection(db, 'dailyGames')
			const q = query(
				gamesRef,
				where('userId', '==', userId),
				orderBy('date', 'desc')
			)
			const querySnapshot = await getDocs(q)
			
			const games: DocumentData[] = []
			querySnapshot.forEach((doc) => {
				games.push(doc.data())
			})
			
			return games.slice(0, limit)
		} catch (error) {
			console.error('Error getting user daily games:', error)
			throw error
		}
	}

	// ============================================================================
	// CHALLENGE STATS FUNCTIONS
	// ============================================================================
	async function saveChallengeStats(userId: string, stats: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const statsRef = doc(db, 'challengeStats', userId)
			await setDoc(statsRef, {
				...stats,
				updatedAt: new Date(),
			})
		} catch (error) {
			throw error
		}
	}

	async function getChallengeStats(userId: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const statsRef = doc(db, 'challengeStats', userId)
			const statsSnap = await getDoc(statsRef)
			
			if (statsSnap.exists()) {
				return statsSnap.data()
			}
			return null
		} catch (error) {
			throw error
		}
	}

	// ============================================================================
	// DAILY GAME STATE FUNCTIONS
	// ============================================================================
	async function saveDailyGameState(userId: string, date: string, gameState: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const gameRef = doc(db, 'dailyGameStates', `${userId}_${date}`)
			await setDoc(gameRef, {
				...gameState,
				userId,
				date,
				updatedAt: new Date(),
			})
		} catch (error) {
			throw error
		}
	}

	async function getDailyGameState(userId: string, date: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const gameRef = doc(db, 'dailyGameStates', `${userId}_${date}`)
			const gameSnap = await getDoc(gameRef)
			
			if (gameSnap.exists()) {
				return gameSnap.data()
			}
			return null
		} catch (error) {
			throw error
		}
	}

	// ============================================================================
	// CHALLENGE STATE FUNCTIONS
	// ============================================================================
	async function saveChallengeState(userId: string, date: string, challengeState: any) {
		try {
			const { db } = useNuxtApp().$firebase
			const challengeRef = doc(db, 'challengeStates', `${userId}_${date}`)
			await setDoc(challengeRef, {
				...challengeState,
				userId,
				date,
				updatedAt: new Date(),
			})
		} catch (error) {
			throw error
		}
	}

	async function getChallengeState(userId: string, date: string) {
		try {
			const { db } = useNuxtApp().$firebase
			const challengeRef = doc(db, 'challengeStates', `${userId}_${date}`)
			const challengeSnap = await getDoc(challengeRef)
			
			if (challengeSnap.exists()) {
				return challengeSnap.data()
			}
			return null
		} catch (error) {
			throw error
		}
	}

	return {
		// Utility
		testFirestoreConnection,
		testFirestoreWrite,
		
		// User Profile
		createUserProfile,
		updateUserProfile,
		getUserProfile,
		
		// Game Stats
		saveGameStats,
		getGameStats,
		updateGameStats,
		
		// Daily Games
		saveDailyGame,
		getDailyGame,
		getUserDailyGames,
		
		// Challenge Stats
		saveChallengeStats,
		getChallengeStats,
		
		// Daily Game State
		saveDailyGameState,
		getDailyGameState,
		
		// Challenge State
		saveChallengeState,
		getChallengeState,
	}
} 