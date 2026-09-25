import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';

function requireEnvironmentVariable(name: string, value: string | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return normalizedValue;
}

const firebaseOptions: FirebaseOptions = {
  apiKey: requireEnvironmentVariable(
    'VITE_FIREBASE_API_KEY',
    import.meta.env.VITE_FIREBASE_API_KEY,
  ),
  authDomain: requireEnvironmentVariable(
    'VITE_FIREBASE_AUTH_DOMAIN',
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: requireEnvironmentVariable(
    'VITE_FIREBASE_PROJECT_ID',
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  ),
  appId: requireEnvironmentVariable('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID),
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseOptions);
}
