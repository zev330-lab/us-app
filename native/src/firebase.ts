import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';
// getReactNativePersistence is exported from @firebase/auth under the
// react-native condition, but TS's bundler resolution falls back to the
// generic types entry and doesn't see it. Import via require-style and assert.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('firebase/auth') as {
  getReactNativePersistence: (storage: unknown) => unknown;
};

const firebaseConfig = {
  apiKey: 'AIzaSyDZE2plhW9e2GPJsEwSjR6Bdra_H0PD2Ek',
  authDomain: 'us-app-4d572.firebaseapp.com',
  databaseURL: 'https://us-app-4d572-default-rtdb.firebaseio.com',
  projectId: 'us-app-4d572',
  storageBucket: 'us-app-4d572.firebasestorage.app',
  messagingSenderId: '708596737937',
  appId: '1:708596737937:web:664cd9b495c01696cb1c30',
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  persistence: getReactNativePersistence(AsyncStorage) as any,
});

const db = getDatabase(app);

export { app, auth, db };
