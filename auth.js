import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Login function
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        window.location.href = "dashboard.html";
      } catch (error) {
        document.getElementById('login-error').textContent = error.message;
        console.error("Login error:", error);
      }
    });
  }

  // Register function
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered:", userCredential.user);
        window.location.href = "dashboard.html";
      } catch (error) {
        document.getElementById('register-error').textContent = error.message;
        console.error("Registration error:", error);
      }
    });
  }

  // Tab switching
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  
  if (loginTab && registerTab) {
    loginTab.addEventListener('click', () => {
      document.getElementById('login-form').classList.remove('hidden');
      document.getElementById('register-form').classList.add('hidden');
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
      document.getElementById('register-form').classList.remove('hidden');
      document.getElementById('login-form').classList.add('hidden');
      registerTab.classList.add('active');
      loginTab.classList.remove('active');
    });
  }
});
