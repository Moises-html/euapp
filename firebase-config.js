const firebaseConfig = {
    apiKey: "AIzaSyC5ZzXiOe8-Zad44M-AMRc8Yczb5nVurpU",
    authDomain: "onibusnaestrada-ad313.firebaseapp.com",
    databaseURL: "https://onibusnaestrada-ad313-default-rtdb.firebaseio.com",
    projectId: "onibusnaestrada-ad313",
    storageBucket: "onibusnaestrada-ad313.firebasestorage.app",
    messagingSenderId: "432204344739",
    appId: "1:432204344739:web:8b89dd476d59578fabbe16",
    measurementId: "G-LZFC78XWFW"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const db = firebase.database();