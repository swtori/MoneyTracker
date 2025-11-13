// ============================================
// CONFIGURATION FIREBASE REALTIME DATABASE
// ============================================
// Configuration pour Firebase Realtime Database
// Projet : MoneyTracker (moneytracker-40c59)
// L'URL de la base de données est : https://moneytracker-40c59-default-rtdb.europe-west1.firebasedatabase.app/

const firebaseConfig = {
    apiKey: "AIzaSyCKYyOhqWbmMgRYZlufFYjLJf75TXRxrdQ",
    authDomain: "moneytracker-40c59.firebaseapp.com",
    databaseURL: "https://moneytracker-40c59-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "moneytracker-40c59",
    storageBucket: "moneytracker-40c59.firebasestorage.app",
    messagingSenderId: "482673370712",
    appId: "1:482673370712:web:0f244fd172cbd8ac4bcc2d",
    measurementId: "G-812W3BCT24"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Realtime Database
const database = firebase.database();

