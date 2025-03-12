// Import and configure Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js';
import { getStorage, ref, uploadString, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.0/firebase-storage.js';

console.log('Initializing Firebase...');

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

let app, db, analytics, storage;

try {
    console.log('Creating Firebase app instance...');
    app = initializeApp(firebaseConfig);
    
    console.log('Initializing Firestore...');
    db = getFirestore(app);
    
    console.log('Initializing Analytics...');
    analytics = getAnalytics(app);
    
    console.log('Initializing Storage...');
    storage = getStorage(app);

    // Log page view
    logEvent(analytics, 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
    console.log('Page view logged');

    // Export functions for use in other files
    window.db = {
        // Add a new subscriber
        addSubscriber: async (email, amount) => {
            try {
                const docRef = await addDoc(collection(db, 'subscribers'), {
                    email,
                    amount: parseFloat(amount),
                    timestamp: serverTimestamp()
                });
                console.log('Document written with ID:', docRef.id);
                return docRef;
            } catch (error) {
                console.error('Error adding subscriber:', error);
                throw error;
            }
        },

        // Get total bribe amount
        getTotalBribes: async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'subscribers'));
                let total = 0;
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.amount) {
                        total += data.amount;
                    }
                });
                console.log('Total bribes:', total);
                return total;
            } catch (error) {
                console.error('Error getting total bribes:', error);
                throw error;
            }
        }
    };

    window.analytics = {
        // Log an event
        logEvent: (eventName, params) => {
            try {
                logEvent(analytics, eventName, params);
                console.log('Analytics event logged:', eventName, params);
            } catch (error) {
                console.error('Error logging event:', error);
            }
        }
    };

    // Storage functions
    window.storage = {
        // Upload base64 image to Firebase Storage
        uploadPreviewImage: async (base64Image) => {
            try {
                console.log('Creating storage reference...');
                const storageRef = ref(storage, 'preview/social-preview.jpg');
                
                console.log('Processing base64 image...');
                const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
                
                console.log('Uploading image to Firebase Storage...');
                await uploadString(storageRef, base64Data, 'base64', {
                    contentType: 'image/jpeg'
                });
                
                console.log('Getting download URL...');
                const downloadURL = await getDownloadURL(storageRef);
                console.log('Image uploaded successfully:', downloadURL);
                return downloadURL;
            } catch (error) {
                console.error('Error uploading image:', error);
                throw error;
            }
        }
    };

    console.log('Firebase initialization complete');

} catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
}

export { app, db, analytics, storage };
