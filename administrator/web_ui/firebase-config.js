// administrator/web_ui/firebase-config.js

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyBhTCwVOAnNpLlQ9OkaZwKuEVzCeL5EbHE",
    authDomain: "ntt-escape-2024.firebaseapp.com",
    projectId: "ntt-escape-2024",
    storageBucket: "ntt-escape-2024.appspot.com",
    messagingSenderId: "866794486830",
    appId: "1:866794486830:web:c0867fcd4e8d544851b3bf"
  };

// Firebase initialisieren
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
