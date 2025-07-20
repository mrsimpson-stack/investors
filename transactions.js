import { auth, db } from './firebase.js';

// DOM elements
const filterButtons = document.querySelectorAll('.filter-btn');
const transactionsList = document.getElementById('transactions-list');
const logoutBtn = document.getElementById('logout-btn');

// Load transactions based on filter
function loadTransactions(filter = 'all') {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    let query = db.collection('transactions')
        .where('userId', '==', user.uid)
        .orderBy('date', 'desc');
    
    if (filter !== 'all') {
        query = query.where('type', '==', filter);
    }
    
    query.get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            transactionsList.innerHTML = `
                <div class="no-transactions">
                    <p>No transactions found</p>
                </div>
            `;
            return;
        }
        
        transactionsList.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const transaction = doc.data();
            const date = transaction.date.toDate();
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            
            let transactionItem = document.createElement('div');
            transactionItem.className = `transaction-item transaction-${transaction.type}`;
            
            transactionItem.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-type">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                    <span class="transaction-date">${formattedDate}</span>
                    ${transaction.description ? `<span class="transaction-description">${transaction.description}</span>` : ''}
                </div>
                <div class="transaction-amount">$${transaction.amount.toLocaleString()}</div>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
    }).catch((error) => {
        console.error('Error getting transactions: ', error);
    });
}

// Filter buttons
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        // Load transactions with selected filter
        loadTransactions(button.dataset.type);
    });
});

// Load all transactions by default
loadTransactions();

// Logout button
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });
}