// Import Firebase functions
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
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

console.log('Initializing Firebase...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

console.log('Firebase initialized');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded in newsletter.js');
    
    const form = document.getElementById('newsletterForm');
    const successMessage = document.getElementById('successMessage');
    const submitButton = document.querySelector('.submit-button');
    
    console.log('Elements found:', {
        form: !!form,
        successMessage: !!successMessage,
        submitButton: !!submitButton
    });

    // Handle form submission
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted');

            const email = document.getElementById('email').value;
            const amount = document.getElementById('amount').value || '0';
            console.log('Form data:', { email, amount });

            try {
                console.log('Saving to Firestore...');
                // Save to Firestore
                const docRef = await addDoc(collection(db, 'subscribers'), {
                    email,
                    amount: parseFloat(amount),
                    timestamp: serverTimestamp()
                });
                console.log('Document written with ID:', docRef.id);

                // Track form submission in Analytics
                logEvent(analytics, 'newsletter_signup', {
                    bribe_amount: parseFloat(amount)
                });
                console.log('Analytics event logged');

                // Hide form immediately
                form.style.opacity = 0;
                form.style.display = 'none';
                
                // Show and animate success message
                successMessage.style.display = 'block';
                successMessage.style.opacity = 0;

                // Create animation timeline
                const tl = gsap.timeline();

                // Animate success message
                tl.to(successMessage, {
                    opacity: 1,
                    y: [20, 0],
                    duration: 0.5,
                    ease: "power2.out"
                });

                // Animate check icon
                tl.from(successMessage.querySelector('.fa-check-circle'), {
                    scale: 0,
                    rotation: -180,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.5)"
                }, "-=0.3");

                // Animate social icons
                tl.from(successMessage.querySelectorAll('.social-icon'), {
                    opacity: 0,
                    x: -30,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out"
                });

                // Animate privacy disclaimer
                tl.from(successMessage.querySelector('.privacy-disclaimer'), {
                    opacity: 0,
                    y: 20,
                    duration: 0.5,
                    ease: "power2.out"
                });

            } catch (error) {
                console.error('Error saving to Firestore:', error);
                logEvent(analytics, 'signup_error', {
                    error_message: error.message
                });
                alert('There was an error submitting your information. Please try again.');
            }
        });

        // Also handle submit button click directly
        submitButton.addEventListener('click', (e) => {
            console.log('Submit button clicked');
            // Let the form's submit event handler do the work
            form.dispatchEvent(new Event('submit'));
        });
    }

    // Add hover animations for buttons
    document.querySelectorAll('.social-icon, .submit-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
});
