import { auth, db, storage } from './firebase.js';

// DOM elements
const methodTabs = document.querySelectorAll('.method-tab');
const methodContents = document.querySelectorAll('.method-content');
const depositAmount = document.getElementById('deposit-amount');
const depositScreenshot = document.getElementById('deposit-screenshot');
const submitDeposit = document.getElementById('submit-deposit');
const successModal = document.getElementById('deposit-success-modal');
const successOkBtn = document.getElementById('success-ok-btn');
const logoutBtn = document.getElementById('logout-btn');

// Method tab switching
methodTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        methodTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all method contents
        methodContents.forEach(content => content.classList.add('hidden'));
        // Show corresponding method content
        const methodId = `${tab.dataset.method}-method`;
        document.getElementById(methodId).classList.remove('hidden');
    });
});

// Submit deposit
if (submitDeposit) {
    submitDeposit.addEventListener('click', async () => {
        const amount = parseFloat(depositAmount.value);
        const file = depositScreenshot.files[0];
        
        if (!amount || amount < 10000) {
            alert('Please enter a valid amount (minimum $10,000)');
            return;
        }
        
        if (!file) {
            alert('Please upload a payment screenshot');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // Upload screenshot to Firebase Storage
            const storageRef = storage.ref(`deposits/${user.uid}/${file.name}`);
            await storageRef.put(file);
            const screenshotUrl = await storageRef.getDownloadURL();
            
            // Update user balance
            await db.collection('users').doc(user.uid).update({
                balance: firebase.firestore.FieldValue.increment(amount),
                lastEarningDate: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Add transaction record
            await db.collection('transactions').add({
                userId: user.uid,
                type: 'deposit',
                amount: amount,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                description: 'Funds deposit',
                screenshotUrl: screenshotUrl,
                status: 'completed'
            });
            
            // Show success modal
            successModal.classList.remove('hidden');
        } catch (error) {
            alert(`Error processing deposit: ${error.message}`);
        }
    });
}

// Success modal OK button
if (successOkBtn) {
    successOkBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        window.location.href = 'dashboard.html';
    });
}

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}