import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// Firebase configuration from Google Cloud Console
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '455157814939',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

let app;
let auth;
let googleProvider;
let db;
let storage;
let analytics;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig)

    // Auth
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()

    // Firestore - Static import, synchronous init
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
    })

    // Storage
    storage = getStorage(app)

    // Analytics
    if (firebaseConfig.measurementId) {
        try {
            analytics = getAnalytics(app)
        } catch (err) {
            console.warn("Analytics init failed:", err)
        }
    }

} catch (error) {
    console.error("Firebase Initialization Critical Failure:", error)
}

export { auth, googleProvider, db, storage, analytics }
export default app
