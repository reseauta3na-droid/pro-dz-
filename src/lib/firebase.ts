import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, orderBy, getDocFromServer, FirestoreError, Firestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } from 'firebase/firestore';

// Standard Firebase error handling for this environment
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: Auth | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isInitialized = false;

export async function getFirebase() {
  if (isInitialized) return { app, db, auth };
  
  try {
    // Try to load config from the root
    // In Vite, we can use / prefix for public or relative for source
    // But since it's a JSON file we might need to fetch it if import fails
    let firebaseConfig;
    try {
      const response = await fetch('/firebase-applet-config.json');
      if (!response.ok) throw new Error('Failed to fetch config');
      firebaseConfig = await response.json();
    } catch (e) {
      console.warn('Could not fetch firebase-applet-config.json from root, trying import...');
      // @ts-ignore
      firebaseConfig = await import('../../firebase-applet-config.json').then(m => m.default);
    }

    if (!firebaseConfig) throw new Error('No Firebase configuration found');
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    
    // Enable offline persistence
    try {
      await enableMultiTabIndexedDbPersistence(db);
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence failed-precondition: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence unimplemented: Browser not supported');
        try {
          await enableIndexedDbPersistence(db);
        } catch (e) {
          console.error('Failed to enable single-tab persistence', e);
        }
      }
    }

    auth = getAuth(app);
    isInitialized = true;
    console.log('Firebase initialized successfully');
  } catch (e) {
    console.error('Firebase initialization failed:', e);
  }
  
  return { app, db, auth };
}

export const loginWithGoogle = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized. Please check your configuration.');
  const googleProvider = new GoogleAuthProvider();
  return signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized');
  return signOut(auth);
};

export async function testConnection() {
  const { db } = await getFirebase();
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'heartbeat', 'test'));
    console.log('Firestore connection test successful');
  } catch (error) {
    console.error("Firestore connection test failed:", error);
  }
}
