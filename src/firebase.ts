import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDZE2plhW9e2GPJsEwSjR6Bdra_H0PD2Ek",
  authDomain: "us-app-4d572.firebaseapp.com",
  databaseURL: "https://us-app-4d572-default-rtdb.firebaseio.com",
  projectId: "us-app-4d572",
  storageBucket: "us-app-4d572.firebasestorage.app",
  messagingSenderId: "708596737937",
  appId: "1:708596737937:web:664cd9b495c01696cb1c30"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence);

export { app, auth, db };
