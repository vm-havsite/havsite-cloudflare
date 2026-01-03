// Firebase Auth Setup
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';


const firebaseConfig = {
    apiKey: "AIzaSyC4PK265Bh7rF92ihkUC4MjD4YtN5Y0las",
    authDomain: "havsite-pwa.firebaseapp.com",
    projectId: "havsite-pwa",
    storageBucket: "havsite-pwa.firebasestorage.app",
    messagingSenderId: "994396465347",
    appId: "1:994396465347:web:316c6c07899190088e1a76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Auto-login check when visiting the chat section
function checkAuthState(onAuthenticated, onUnauthenticated) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log('User is signed in:', user);
            if (onAuthenticated) onAuthenticated(user);
        } else {
            console.log('No user signed in');
            if (onUnauthenticated) onUnauthenticated();
        }
    });
}

export { signUp, signIn, signOutUser, checkAuthState,};
export { app, db };


// Example usage
// signUp('test@example.com', 'password123', 'testuser');
// signIn('test@example.com', 'password123');
// signOutUser();
// checkAuthState(() => console.log('User is already signed in'), () => console.log('User needs to sign in'));
