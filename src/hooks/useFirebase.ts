import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, updateDoc, deleteDoc, where, Firestore } from 'firebase/firestore';
import { getFirebase, handleFirestoreError, OperationType } from '../lib/firebase';
import { Technician, Client, Invoice, UserProfile } from '../types';

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebase, setFirebase] = useState<{ auth: Auth | null, db: Firestore | null }>({ auth: null, db: null });

  // Initialize Firebase
  useEffect(() => {
    getFirebase().then(({ auth, db }) => {
      setFirebase({ auth, db });
    });
  }, []);

  useEffect(() => {
    if (!firebase.auth) return;
    const unsubscribe = onAuthStateChanged(firebase.auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (!u) {
        setProfile(null);
        setClients([]);
        setInvoices([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [firebase.auth]);

  // Listen to profile
  useEffect(() => {
    if (!user || !firebase.db || !firebase.auth) return;
    const unsubscribe = onSnapshot(doc(firebase.db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, firebase.auth);
    });
    return unsubscribe;
  }, [user, firebase.db, firebase.auth]);

  // Listen to clients
  useEffect(() => {
    if (!user || !firebase.db || !firebase.auth) return;
    const q = query(collection(firebase.db, 'users', user.uid, 'clients'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const c: Client[] = [];
      snapshot.forEach((doc) => c.push({ ...doc.data(), id: doc.id } as Client));
      setClients(c);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/clients`, firebase.auth);
    });
    return unsubscribe;
  }, [user, firebase.db, firebase.auth]);

  // Listen to invoices
  useEffect(() => {
    if (!user || !firebase.db || !firebase.auth) return;
    const q = query(collection(firebase.db, 'users', user.uid, 'invoices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const i: Invoice[] = [];
      snapshot.forEach((doc) => i.push({ ...doc.data(), id: doc.id } as Invoice));
      setInvoices(i);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/invoices`, firebase.auth);
    });
    return unsubscribe;
  }, [user, firebase.db, firebase.auth]);

  const saveProfile = async (p: Partial<UserProfile>) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      await setDoc(doc(firebase.db, 'users', user.uid), { ...p, id: user.uid }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`, firebase.auth);
    }
  };

  const addClient = async (c: Partial<Client>) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      const newDoc = doc(collection(firebase.db, 'users', user.uid, 'clients'));
      await setDoc(newDoc, { ...c, id: newDoc.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/clients`, firebase.auth);
    }
  };

  const updateClient = async (c: Client) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      await updateDoc(doc(firebase.db, 'users', user.uid, 'clients', c.id), { ...c });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/clients/${c.id}`, firebase.auth);
    }
  };

  const deleteClient = async (id: string) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      await deleteDoc(doc(firebase.db, 'users', user.uid, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/clients/${id}`, firebase.auth);
    }
  };

  const addInvoice = async (i: Partial<Invoice>) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      const newDoc = doc(collection(firebase.db, 'users', user.uid, 'invoices'));
      await setDoc(newDoc, { ...i, id: newDoc.id, technicianId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/invoices`, firebase.auth);
    }
  };

  const updateInvoice = async (i: Invoice) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      await updateDoc(doc(firebase.db, 'users', user.uid, 'invoices', i.id), { ...i });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/invoices/${i.id}`, firebase.auth);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user || !firebase.db || !firebase.auth) return;
    try {
      await deleteDoc(doc(firebase.db, 'users', user.uid, 'invoices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/invoices/${id}`, firebase.auth);
    }
  };

  return {
    user,
    isAuthReady,
    profile,
    clients,
    invoices,
    loading,
    saveProfile,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
