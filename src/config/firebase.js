import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration from Google Cloud Console
// Get these from: https://console.firebase.google.com → Project Settings
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '455157814939',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

let app;
let auth;
let googleProvider;
let db;
let storage;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)

    // Auth
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()

    // Firestore Database (Force Long Polling for strict networks)
    const { initializeFirestore } = await import('firebase/firestore')
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    })

    // Storage
    storage = getStorage(app)

} catch (error) {
    console.error("Firebase Initialization Error:", error)
    // Export nulls so imports don't fail, but usage will throw (caught by ErrorBoundary or handled)
    app = null
    auth = null
    googleProvider = null
    db = null
    storage = null
}

export { auth, googleProvider, db, storage }
export default app
