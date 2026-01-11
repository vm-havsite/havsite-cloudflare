// Firebase Auth Setup
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup 
} from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyC4PK265Bh7rF92ihkUC4MjD4YtN5Y0las",
  authDomain: "havsite-pwa.firebaseapp.com",
  projectId: "havsite-pwa",
  storageBucket: "havsite-pwa.firebasestorage.app",
  messagingSenderId: "994396465347",
  appId: "1:994396465347:web:16939fceebfb70368e1a76",
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup with Email
async function signUp(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save username to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            username: username,
            createdAt: new Date(),
            provider: 'email'
        });
        
        console.log('Signup successful:', user);
        return user;
    } catch (error) {
        console.error('Signup error:', error.message);
        throw error;
    }
}

// Signin with Email
async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Signin successful:', userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error('Signin error:', error.message);
        throw error;
    }
}

// Sign In with Google
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user document already exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // If new user, save their info to Firestore
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                username: user.displayName || 'Google User',
                photoURL: user.photoURL || null,
                createdAt: new Date(),
                provider: 'google'
            });
            console.log('New Google user created:', user);
        } else {
            console.log('Existing Google user signed in:', user);
        }
        
        return user;
    } catch (error) {
        console.error('Error signing in with Google:', error.message);
        throw error;
    }
}

// Signout
async function signOutUser() {
    try {
        await signOut(auth);
        console.log('Signout successful');
    } catch (error) {
        console.error('Signout error:', error.message);
        throw error;
    }
}

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

// Auto-login check when visiting the auth page
function checkAuthState2(destination, onAuthenticated, onUnauthenticated) {
  setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
	  console.log('User is signed in:', user);
          Toast.show('Already signed in, Redirecting');
              if (destination) {
	        window.location.replace(destination);
	      }
        }
    });
  }, 1800); // Wait exactly 1.8 second, then run once
}

export { signUp, signIn, signInWithGoogle, signOutUser, checkAuthState, checkAuthState2 };
export { app, db, auth };

// Example usage
// signUp('test@example.com', 'password123', 'testuser');
// signIn('test@example.com', 'password123');
// signInWithGoogle();
// signOutUser();
// checkAuthState(() => console.log('User is already signed in'), () => console.log('User needs to sign in'));