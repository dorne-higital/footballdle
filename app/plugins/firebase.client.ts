import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
	apiKey: "AIzaSyCqLwV539q81TjG9ZBxcVWJvzQ5QGJzsdk",
	authDomain: "footballdle-e3635.firebaseapp.com",
	projectId: "footballdle-e3635",
	storageBucket: "footballdle-e3635.firebasestorage.app",
	messagingSenderId: "853956062962",
	appId: "1:853956062962:web:f96ddef05bd2ceaaabea6b",
	measurementId: "G-D2FX1P2T6K"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)

export default defineNuxtPlugin(() => {
	return {
		provide: {
			firebase: {
				app,
				auth,
				db
			}
		}
	}
}) 