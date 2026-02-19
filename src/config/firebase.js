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
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

// Initialize Firebase
let app;
let auth;
let googleProvider;
let db;
let storage;
let analytics;

try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()

    // Force Long Polling for strict networks
    const { initializeFirestore } = await import('firebase/firestore')
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    })

    storage = getStorage(app)

    // Analytics (safe init)
    if (firebaseConfig.measurementId) {
        import('firebase/analytics').then(({ getAnalytics }) => {
            analytics = getAnalytics(app)
        }).catch(e => console.warn("Analytics failed to load", e))
    }
} catch (e) {
    console.error("Firebase init failed:", e)
}

export { auth, googleProvider, db, storage, analytics }
export default app
