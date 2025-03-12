// Import Firebase functions
import { 
    getFirestore, 
    collection, 
    getDocs 
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDe3fNSEuvIaysi5gy_7gEEZC5nTrXlizM",
    authDomain: "stoptesla-4dab8.firebaseapp.com",
    projectId: "stoptesla-4dab8",
    storageBucket: "stoptesla-4dab8.firebasestorage.app",
    messagingSenderId: "679837542716",
    appId: "1:679837542716:web:9e8d75fb3d576d346e5639",
    measurementId: "G-7H617LZ8P1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('Script loaded');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    
    const counterElement = document.getElementById('bribeCounter');
    const progressElement = document.getElementById('bribeProgress');
    
    if (!counterElement || !progressElement) {
        console.error('Elements not found:', { counterElement, progressElement });
        return;
    }
    
    console.log('Elements found');
    
    let startAmount = 23500; // Default fallback amount

    try {
        if (navigator.onLine) {
            // Get total bribe amount from Firestore
            const querySnapshot = await getDocs(collection(db, 'subscribers'));
            let totalAmount = 0;
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.amount) {
                    totalAmount += data.amount;
                }
            });

            startAmount = Math.max(totalAmount, startAmount);
            console.log('Total amount from Firestore:', totalAmount);

            // Track total amount in Analytics
            logEvent(analytics, 'bribe_counter_loaded', {
                total_amount: startAmount,
                source: 'firestore'
            });
        } else {
            console.log('Offline mode: using default amount');
            logEvent(analytics, 'bribe_counter_loaded', {
                total_amount: startAmount,
                source: 'default'
            });
        }
    } catch (error) {
        console.warn('Error fetching total amount, using default:', error);
        logEvent(analytics, 'counter_error', {
            error_message: error.message,
            using_default: true
        });
    }
    
    // Animate the counter from 0 to start amount
    const tl = gsap.timeline();
    
    tl.to(counterElement, {
        duration: 2,
        innerText: startAmount,
        snap: { innerText: 1 },
        modifiers: {
            innerText: value => `$${parseInt(value).toLocaleString()}`
        }
    });
    
    tl.to(progressElement, {
        duration: 2,
        width: `${(startAmount / 50000) * 100}%`,
        ease: "power1.out"
    }, 0);
    
    // Add random increases every 5 seconds
    let lastUpdate = Date.now();
    
    setInterval(() => {
        // Skip update if offline and last update was too recent
        if (!navigator.onLine && Date.now() - lastUpdate < 30000) {
            return;
        }

        const currentValue = parseInt(counterElement.innerText.replace(/[$,]/g, ''));
        const increase = Math.floor(Math.random() * 1000) + 200;
        const newValue = Math.min(currentValue + increase, 50000);
        
        gsap.to(counterElement, {
            duration: 1,
            innerText: newValue,
            snap: { innerText: 1 },
            modifiers: {
                innerText: value => `$${parseInt(value).toLocaleString()}`
            }
        });
        
        gsap.to(progressElement, {
            duration: 1,
            width: `${(newValue / 50000) * 100}%`,
            ease: "power1.out"
        });

        // Track counter increase in Analytics only if online
        if (navigator.onLine) {
            logEvent(analytics, 'bribe_counter_increase', {
                increase_amount: increase,
                new_total: newValue,
                is_simulated: true
            });
        }

        lastUpdate = Date.now();
    }, 5000);
});
