import { auth, db } from './firebase.js';

// DOM elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Tab switching
if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

// Login function
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const email = loginEmail.value;
        const password = loginPassword.value;

        if (!email || !password) {
            loginError.textContent = 'Please fill in all fields';
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                loginError.textContent = error.message;
            });
    });
}

// Register function
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        const name = registerName.value;
        const email = registerEmail.value;
        const password = registerPassword.value;
        const confirmPassword = registerConfirmPassword.value;

        if (!name || !email || !password || !confirmPassword) {
            registerError.textContent = 'Please fill in all fields';
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 6) {
            registerError.textContent = 'Password should be at least 6 characters';
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Add user to Firestore
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    balance: 0,
                    totalEarnings: 2000, // Sign-up bonus
                    lastEarningDate: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                registerError.textContent = error.message;
            });
    });
}

// Check auth state on all pages
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        if (window.location.pathname.includes('index.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});