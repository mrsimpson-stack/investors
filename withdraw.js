import { auth, db } from './firebase.js';

// DOM elements
const withdrawAmount = document.getElementById('withdraw-amount');
const withdrawNumber = document.getElementById('withdraw-number');
const withdrawMethod = document.getElementById('withdraw-method');
const submitWithdraw = document.getElementById('submit-withdraw');
const withdrawModal = document.getElementById('withdraw-modal');
const logoutBtn = document.getElementById('logout-btn');

// Submit withdrawal request
if (submitWithdraw) {
    submitWithdraw.addEventListener('click', async () => {
        const amount = parseFloat(withdrawAmount.value);
        const number = withdrawNumber.value;
        const method = withdrawMethod.value;
        
        if (!amount || amount < 10000) {
            alert('Please enter a valid amount (minimum $10,000)');
            return;
        }
        
        if (!number) {
            alert('Please enter your mobile money number');
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        try {
            // Get user balance
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            if (userData.balance < amount) {
                alert('Insufficient balance for this withdrawal');
                return;
            }
            
            // Add withdrawal request
            await db.collection('transactions').add({
                userId: user.uid,
                type: 'withdrawal',
                amount: amount,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                description: 'Withdrawal request',
                status: 'pending',
                method: method,
                number: number
            });
            
            // Show withdrawal modal
            withdrawModal.classList.remove('hidden');
            
            // Hide modal after 5 seconds
            setTimeout(() => {
                withdrawModal.classList.add('hidden');
                window.location.href = 'dashboard.html';
            }, 5000);
        } catch (error) {
            alert(`Error processing withdrawal: ${error.message}`);
        }
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