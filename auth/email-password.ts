import {
    initializeApp
} from 'firebase/app';
import {
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import {
    firebaseConfig
} from './config';
import {
    doc,
    setDoc,
    getFirestore,
    collection,
    getDoc,
    getDocs
} from "firebase/firestore";


const profile = "profile"
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth();

if (window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

const emailInput = document.getElementById('email') !as HTMLInputElement;
const passwordInput = document.getElementById('password') !as HTMLInputElement;
const signInButton = document.getElementById(
    'quickstart-sign-in',
) !as HTMLButtonElement;
const signUpButton = document.getElementById(
    'quickstart-sign-up',
) !as HTMLButtonElement;
const passwordResetButton = document.getElementById(
    'quickstart-password-reset',
) !as HTMLButtonElement;
const verifyEmailButton = document.getElementById(
    'quickstart-verify-email',
) !as HTMLButtonElement;
const signInStatus = document.getElementById(
    'quickstart-sign-in-status',
) !as HTMLSpanElement;
const accountDetails = document.getElementById(
    'quickstart-account-details',
) !as HTMLDivElement;
const profileDetails = document.getElementById(
    'quickstart-profile-details',
) !as HTMLDivElement;

/**
 * Handles the sign in button press.
 */
function toggleSignIn() {
    if (auth.currentUser) {
        signOut(auth);
    } else {
        const email = emailInput.value;
        const password = passwordInput.value;
        if (email.length < 4) {
            alert('Please enter an email address.');
            return;
        }
        if (password.length < 4) {
            alert('Please enter a password.');
            return;
        }
        // Sign in with email and pass.
        signInWithEmailAndPassword(auth, email, password).catch(function(error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
            signInButton.disabled = false;
        });
    }
    signInButton.disabled = true;
}

/**
 * Handles the sign up button press.
 */
function handleSignUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    if (email.length < 4) {
        alert('Please enter an email address.');
        return;
    }
    if (password.length < 4) {
        alert('Please enter a password.');
        return;
    }
    // Create user with email and pass.
    createUserWithEmailAndPassword(auth, email, password).catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
            alert('The password is too weak.');
        } else {
            alert(errorMessage);
        }
        console.log(error);
    });
}

/**
 * Sends an email verification to the user.
 */
function sendVerificationEmailToUser() {
    sendEmailVerification(auth.currentUser!).then(function() {
        // Email Verification sent!
        alert('Email Verification Sent!');
    });
}

function sendPasswordReset() {
    const email = emailInput.value;
    sendPasswordResetEmail(auth, email)
        .then(function() {
            // Password Reset Email Sent!
            alert('Password Reset Email Sent!');
        })
        .catch(function(error) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            if (errorCode == 'auth/invalid-email') {
                alert(errorMessage);
            } else if (errorCode == 'auth/user-not-found') {
                alert(errorMessage);
            }
            console.log(error);
        });
}


async function setData(uid, user, value) {
    try {
        const cityRef = doc(db, profile, uid);
        console.log(`write uid ${uid}`)
        // console.log(`write ${JSON.stringify(cityRef)}`)
        const obj1={
            readkey: value,
            email: user.email,
        }

        const result = await setDoc(cityRef, obj1
        , {
            merge: true
        });
        localStorage.setItem('tidalforce-profile', JSON.stringify(obj1))
        // console.log(`result write ${JSON.stringify(result)}`)
    } catch (error) {
        console.error("Error setting documents: ", error);
    }
}

async function getDataAll() {
    try {
        const querySnapshot = await getDocs(collection(db, profile));
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

async function getData(uid) {
    try {
        const docRef = doc(db, profile, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Document data:", JSON.stringify(docSnap.data()));
            profileDetails.textContent = JSON.stringify(docSnap.data(), null, '  ');
        } else {
            // docSnap.data() will be undefined in this case
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error getting document: ", error);
    }
}

function getUrlParams(url: string): Record < string, string | string[] > {
    const urlObject = new URL(url);
    const searchParams = new URLSearchParams(urlObject.search);
    const params: Record < string, string | string[] > = {};

    searchParams.forEach((value, key) => {
        if (params.hasOwnProperty(key)) {
            if (!Array.isArray(params[key])) {
                params[key] = [params[key] as string];
            }
            (params[key] as string[]).push(value);
        } else {
            params[key] = value;
        }
    });
    return params;
}



// Listening for auth state changes.
onAuthStateChanged(auth, function(user) {
    verifyEmailButton.disabled = true;
    if (user) {
        // User is signed in.
        const displayName = user.displayName;
        const email = user.email;
        const emailVerified = user.emailVerified;
        const photoURL = user.photoURL;
        const isAnonymous = user.isAnonymous;
        const uid = user.uid;
        const providerData = user.providerData;
        signInStatus.textContent = 'Signed in';
        signInButton.textContent = 'Sign out';
        accountDetails.textContent = JSON.stringify(user, null, '  ');
        if (!emailVerified) {
            verifyEmailButton.disabled = false;
        }
        // debugger

        const url = window.location
        const params = getUrlParams(url);
        console.log(params);
        if (params.readkey) {
            setData(uid, user, params.readkey);
        }
        getData(uid);
    } else {
        // User is signed out.
        signInStatus.textContent = 'Signed out';
        signInButton.textContent = 'Sign in';
        accountDetails.textContent = 'null';
    }
    signInButton.disabled = false;
});

signInButton.addEventListener('click', toggleSignIn, false);
signUpButton.addEventListener('click', handleSignUp, false);
verifyEmailButton.addEventListener('click', sendVerificationEmailToUser, false);
passwordResetButton.addEventListener('click', sendPasswordReset, false);
