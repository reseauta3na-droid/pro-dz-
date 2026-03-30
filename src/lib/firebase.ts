import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, onSnapshot, query, where, orderBy, getDocFromServer, FirestoreError, Firestore, initializeFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent, Analytics, isSupported } from 'firebase/analytics';

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
let analytics: Analytics | null = null;
let isInitialized = false;
let cachedConfig: any = null;

export async function getFirebase() {
  if (isInitialized) return { app, db, auth, analytics };
  
  try {
    // Try to load config from the root
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
    
    cachedConfig = firebaseConfig;
    
    // Check if appId is a placeholder or empty and handle it
    const isPlaceholderAppId = !firebaseConfig.appId || 
      firebaseConfig.appId.includes('TODO') || 
      firebaseConfig.appId === '';

    app = initializeApp(firebaseConfig);
    
    // Use Long Polling to bypass potential WebSocket blocking/domain issues
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
    
    auth = getAuth(app);

    // Initialize Analytics if supported and appId is valid
    try {
      const analyticsSupported = await isSupported();
      if (analyticsSupported && !isPlaceholderAppId) {
        analytics = getAnalytics(app);
      }
    } catch (e) {
      console.warn('Analytics not supported');
    }

    isInitialized = true;
    console.log('Firebase initialized');
  } catch (e) {
    console.error('Firebase init failed:', e);
  }
  
  return { app, db, auth, analytics };
}

export const loginWithGoogle = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized. Please check your configuration.');
  const googleProvider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.error("🚨 Erreur d'authentification : Domaine non autorisé.");
      console.error("Veuillez ajouter ce domaine dans votre Console Firebase (Authentication > Settings > Authorized domains) :");
      console.error(window.location.hostname);
      alert("Erreur : Ce domaine n'est pas autorisé dans votre console Firebase. Veuillez suivre les instructions dans la console de développement.");
    } else if (error.code === 'auth/configuration-not-found') {
      console.error("🚨 Erreur d'authentification : Google Sign-In n'est pas activé.");
      console.error("Veuillez activer le fournisseur 'Google' dans votre Console Firebase (Authentication > Sign-in method).");
      alert("Erreur : La connexion Google n'est pas activée dans votre console Firebase. Veuillez l'activer dans l'onglet 'Sign-in method'.");
    }
    throw error;
  }
};

export const logout = async () => {
  const { auth } = await getFirebase();
  if (!auth) throw new Error('Firebase not initialized');
  return signOut(auth);
};

export async function testConnection() {
  const { db } = await getFirebase();
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'heartbeat', 'test'));
    console.log('Firestore connection test successful');
    return true;
  } catch (error: any) {
    const projectId = cachedConfig?.projectId || 'votre projet';
    if (error.message?.includes('the client is offline')) {
      console.error(`🚨 Erreur Firestore : Le client est hors-ligne pour le projet "${projectId}".`);
      console.error("Ceci est généralement dû à l'une de ces 3 raisons :");
      console.error("1. La clé API est restreinte à 'Android' uniquement dans Google Cloud Console. Elle doit autoriser les requêtes Web.");
      console.error(`2. Le domaine '${window.location.hostname}' n'est pas autorisé dans Firebase Auth > Settings > Authorized domains.`);
      console.error(`3. La base de données Firestore n'a pas été créée (ou n'est pas en mode test/production) dans le projet '${projectId}'.`);
    } else {
      console.error("Firestore connection test failed:", error);
    }
    return false;
  }
}
