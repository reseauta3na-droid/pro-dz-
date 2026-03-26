import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, orderBy, getDocFromServer, FirestoreError } from 'firebase/firestore';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
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

let app: any, db: any, auth: any;
let isInitialized = false;

export async function getFirebase() {
  if (isInitialized) return { app, db, auth };
  
  try {
    const configPath = '../../firebase-applet-config.json';
    // @ts-ignore
    const firebaseConfig = await import(/* @vite-ignore */ configPath).then(m => m.default);
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence } = await import('firebase/firestore');
    const { getAuth } = await import('firebase/auth');
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    
    // Enable offline persistence
    try {
      await enableMultiTabIndexedDbPersistence(db);
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn('Firestore persistence failed-precondition: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
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
  } catch (e) {
    console.warn('Firebase configuration not found or invalid. Please complete the setup.');
  }
  
  return { app, db, auth };
}

// For backward compatibility with existing imports
export { db, auth };

export const loginWithGoogle = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized. Please check your configuration.');
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
  const googleProvider = new GoogleAuthProvider();
  return signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized');
  const { signOut } = await import('firebase/auth');
  return signOut(auth);
};

export async function testConnection() {
  const { db } = await getFirebase();
  if (!db) return;
  try {
    // Try to get a non-existent document in a valid path to test connectivity
    // We use a random ID to avoid cache and ensure a network request if possible
    await getDocFromServer(doc(db, 'heartbeat', 'test'));
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.error("Please check your Firebase configuration. The client is offline or Firestore is unavailable.");
    }
    // We don't throw here to avoid crashing the app on startup if Firestore is just slow to connect
  }
}
