import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase - À remplacer par vos propres clés
const firebaseConfig = {
  apiKey: "AIzaSyC6A5AS0hZb_pwPU7CB-WO202fCTG0C1pk",
  authDomain: "vote-aa60e.firebaseapp.com",
  projectId: "vote-aa60e",
  storageBucket: "vote-aa60e.firebasestorage.app",
  messagingSenderId: "449755832402",
  appId: "1:449755832402:web:40981a8df59487eeedff8b"
}


// Vérification des clés de configuration
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error("ERREUR CRITIQUE: Vous n'avez pas configuré les clés Firebase dans src/firebase/config.js");
  alert("Veuillez configurer src/firebase/config.js avec vos propres clés Firebase pour que l'application fonctionne.");
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Initialiser les services
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

