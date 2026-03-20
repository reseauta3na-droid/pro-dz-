import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Technician, Client, Invoice, UserProfile } from '../types';

export function useFirebase() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (u) => {
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
  }, []);

  // Listen to profile
  useEffect(() => {
    if (!user || !db) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, auth);
    });
    return unsubscribe;
  }, [user]);

  // Listen to clients
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'users', user.uid, 'clients'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const c: Client[] = [];
      snapshot.forEach((doc) => c.push({ ...doc.data(), id: doc.id } as Client));
      setClients(c);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/clients`, auth);
    });
    return unsubscribe;
  }, [user]);

  // Listen to invoices
  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'users', user.uid, 'invoices'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const i: Invoice[] = [];
      snapshot.forEach((doc) => i.push({ ...doc.data(), id: doc.id } as Invoice));
      setInvoices(i);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/invoices`, auth);
    });
    return unsubscribe;
  }, [user]);

  const saveProfile = async (p: Partial<UserProfile>) => {
    if (!user || !db) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { ...p, id: user.uid }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`, auth);
    }
  };

  const addClient = async (c: Partial<Client>) => {
    if (!user || !db) return;
    try {
      const newDoc = doc(collection(db, 'users', user.uid, 'clients'));
      await setDoc(newDoc, { ...c, id: newDoc.id });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/clients`, auth);
    }
  };

  const updateClient = async (c: Client) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'clients', c.id), { ...c });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/clients/${c.id}`, auth);
    }
  };

  const deleteClient = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/clients/${id}`, auth);
    }
  };

  const addInvoice = async (i: Partial<Invoice>) => {
    if (!user || !db) return;
    try {
      const newDoc = doc(collection(db, 'users', user.uid, 'invoices'));
      await setDoc(newDoc, { ...i, id: newDoc.id, technicianId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/invoices`, auth);
    }
  };

  const updateInvoice = async (i: Invoice) => {
    if (!user || !db) return;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'invoices', i.id), { ...i });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/invoices/${i.id}`, auth);
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'invoices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/invoices/${id}`, auth);
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
