
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase - À REMPLACER avec vos propres valeurs
const firebaseConfig = {
    apiKey: "Mon_APIKEY",
    authDomain: "forum-26161.firebaseapp.com",
    projectId: "forum-26161",
    storageBucket: "forum-26161.firebasestorage.app",
    messagingSenderId: "236668377820",
    appId: "1:236668377820:web:8bf72444f8da553967f219"
}

// Initialisation de Firebase
const app = initializeApp(firebaseConfig)

// Services Firebase
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
