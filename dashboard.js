import { auth, db } from './firebase.js';

// DOM elements
const userNameElement = document.getElementById('user-name');
const accountBalanceElement = document.getElementById('account-balance');
const todayEarningsElement = document.getElementById('today-earnings');
const totalEarningsElement = document.getElementById('total-earnings');
const logoutBtn = document.getElementById('logout-btn');
const bonusModal = document.getElementById('bonus-modal');
const bonusOkBtn = document.getElementById('bonus-ok-btn');
const investmentModal = document.getElementById('investment-modal');
const gotoDepositBtn = document.getElementById('goto-deposit-btn');
const closeModalButtons = document.querySelectorAll('.close-modal');
const investButtons = document.querySelectorAll('.btn-invest');

// Check if user is logged in and get user data
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Update UI with user data
        userNameElement.textContent = userData.name;
        accountBalanceElement.textContent = `$${userData.balance.toLocaleString()}`;
        totalEarningsElement.textContent = `$${userData.totalEarnings.toLocaleString()}`;
        
        // Calculate today's earnings (if any)
        const todayEarnings = calculateTodaysEarnings(userData);
        todayEarningsElement.textContent = `$${todayEarnings.toLocaleString()}`;
        
        // Show bonus modal if it's a new user with no deposits
        if (userData.balance === 0 && userData.totalEarnings === 2000) {
            bonusModal.classList.remove('hidden');
        }
        
        // Update earnings every 24 hours
        updateEarnings(user.uid, userData);
    }
});

// Calculate today's earnings based on investment packages
function calculateTodaysEarnings(userData) {
    if (!userData.lastEarningDate) return 0;
    
    const lastEarningDate = userData.lastEarningDate.toDate();
    const now = new Date();
    const hoursDiff = (now - lastEarningDate) / (1000 * 60 * 60);
    
    if (hoursDiff >= 24) {
        // Determine daily earnings based on investment amount
        if (userData.balance >= 200000) return 25000;
        if (userData.balance >= 120000) return 17000;
        if (userData.balance >= 75000) return 12000;
        if (userData.balance >= 50000) return 7000;
        if (userData.balance >= 30000) return 4000;
        if (userData.balance >= 10000) return 2000;
        return 0;
    }
    
    return 0;
}

// Update earnings every 24 hours
async function updateEarnings(userId, userData) {
    if (!userData.lastEarningDate) return;
    
    const lastEarningDate = userData.lastEarningDate.toDate();
    const now = new Date();
    const hoursDiff = (now - lastEarningDate) / (1000 * 60 * 60);
    
    if (hoursDiff >= 24) {
        const dailyEarnings = calculateTodaysEarnings(userData);
        
        if (dailyEarnings > 0) {
            // Update user data with new earnings
            await db.collection('users').doc(userId).update({
                balance: firebase.firestore.FieldValue.increment(dailyEarnings),
                totalEarnings: firebase.firestore.FieldValue.increment(dailyEarnings),
                lastEarningDate: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Add transaction record
            await db.collection('transactions').add({
                userId: userId,
                type: 'earning',
                amount: dailyEarnings,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                description: 'Daily earnings'
            });
            
            // Update UI
            accountBalanceElement.textContent = `$${(userData.balance + dailyEarnings).toLocaleString()}`;
            totalEarningsElement.textContent = `$${(userData.totalEarnings + dailyEarnings).toLocaleString()}`;
            todayEarningsElement.textContent = `$${dailyEarnings.toLocaleString()}`;
        }
    }
}

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}

// Bonus modal
if (bonusOkBtn) {
    bonusOkBtn.addEventListener('click', () => {
        bonusModal.classList.add('hidden');
    });
}

// Investment package buttons
if (investButtons) {
    investButtons.forEach(button => {
        button.addEventListener('click', () => {
            investmentModal.classList.remove('hidden');
        });
    });
}

// Go to deposit button
if (gotoDepositBtn) {
    gotoDepositBtn.addEventListener('click', () => {
        investmentModal.classList.add('hidden');
        window.location.href = 'deposit.html';
    });
}

// Close modal buttons
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.bonus-modal, .investment-modal');
        modal.classList.add('hidden');
    });
});