import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Calculator, Calendar, User as UserIcon, Briefcase, FileText, CreditCard, Bell } from 'lucide-react';
import { Card } from './components/ui/Card';
import { Input } from './components/ui/Input';
import { Button } from './components/ui/Button';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { InvoiceList } from './components/InvoiceList';
import { ClientList } from './components/ClientList';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { ClientForm } from './components/ClientForm';
import { Modal } from './components/ui/Modal';
import { PinLock } from './components/PinLock';
import { PinSetup } from './components/PinSetup';
import { ProfileSetup } from './components/ProfileSetup';
import { SignaturePad } from './components/SignaturePad';
import { StampPad } from './components/StampPad';
import { generateInvoicePDF } from './utils/pdfGenerator';
import { formatCurrency } from './utils/calculations';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Onboarding } from './components/Onboarding';
import { Invoice, Client, Technician, UserProfile, Expense } from './types';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { startOfMonth, endOfMonth, format, isWithinInterval, subMonths } from 'date-fns';
import { getFirebase, handleFirestoreError, OperationType, loginWithGoogle, logout, testConnection } from './lib/firebase';
import { onAuthStateChanged, User, Auth } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, Firestore, deleteDoc } from 'firebase/firestore';

type AppState = 'loading' | 'onboarding' | 'setup-profile' | 'setup-pin' | 'locked' | 'ready';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebase, setFirebase] = useState<{ auth: Auth | null, db: Firestore | null }>({ auth: null, db: null });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Firebase
  useEffect(() => {
    getFirebase().then(({ auth, db }) => {
      setFirebase({ auth, db });
      if (db) testConnection();
    });
  }, []);
  
  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState<{ title: string, message: string } | null>(null);
  
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [editingExpense, setEditingExpense] = useState<Partial<Expense> | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Firebase Auth Listener
  useEffect(() => {
    if (!firebase.auth) return;
    const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [firebase.auth]);

  // Sync data from Firestore when user logs in
  useEffect(() => {
    if (!user || !firebase.db || !firebase.auth) return;

    setIsSyncing(true);
    const userDocRef = doc(firebase.db, 'users', user.uid);
    
    // Load profile
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const cloudProfile = docSnap.data() as UserProfile;
        setProfile(prev => ({ ...prev, ...cloudProfile }));
        if (cloudProfile.pinCode) {
          setAppState('locked');
        } else {
          setAppState('ready');
        }
      } else {
        setAppState('onboarding');
      }
    }).catch(err => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`, firebase.auth));

    // Listen for clients
    const clientsQuery = query(collection(firebase.db, 'users', user.uid, 'clients'));
    const unsubscribeClients = onSnapshot(clientsQuery, { includeMetadataChanges: true }, (snapshot) => {
      const cloudClients = snapshot.docs.map(doc => doc.data() as Client);
      if (cloudClients.length > 0) {
        setClients(cloudClients);
        localStorage.setItem('tech_dz_clients', JSON.stringify(cloudClients));
      }
      setIsSyncing(snapshot.metadata.hasPendingWrites);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/clients`, firebase.auth));

    // Listen for invoices
    const invoicesQuery = query(collection(firebase.db, 'users', user.uid, 'invoices'));
    const unsubscribeInvoices = onSnapshot(invoicesQuery, { includeMetadataChanges: true }, (snapshot) => {
      const cloudInvoices = snapshot.docs.map(doc => doc.data() as Invoice);
      if (cloudInvoices.length > 0) {
        setInvoices(cloudInvoices);
        localStorage.setItem('tech_dz_invoices', JSON.stringify(cloudInvoices));
      }
      setIsSyncing(snapshot.metadata.hasPendingWrites);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/invoices`, firebase.auth));

    // Listen for expenses
    const expensesQuery = query(collection(firebase.db, 'users', user.uid, 'expenses'));
    const unsubscribeExpenses = onSnapshot(expensesQuery, { includeMetadataChanges: true }, (snapshot) => {
      const cloudExpenses = snapshot.docs.map(doc => doc.data() as Expense);
      if (cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
        localStorage.setItem('tech_dz_expenses', JSON.stringify(cloudExpenses));
      }
      setIsSyncing(snapshot.metadata.hasPendingWrites);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/expenses`, firebase.auth));

    return () => {
      unsubscribeClients();
      unsubscribeInvoices();
      unsubscribeExpenses();
    };
  }, [user, firebase.db, firebase.auth]);

  // Load data from localStorage
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('tech_dz_profile');
    const savedInvoices = localStorage.getItem('tech_dz_invoices');
    const savedClients = localStorage.getItem('tech_dz_clients');

    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      if (!parsedProfile.pinCode) {
        setAppState('setup-pin');
      } else {
        setAppState('locked');
      }
    } else {
      setAppState('setup-profile');
    }

    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedClients) setClients(JSON.parse(savedClients));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (profile) localStorage.setItem('tech_dz_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('tech_dz_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('tech_dz_clients', JSON.stringify(clients));
  }, [clients]);

  // Update favicon
  useEffect(() => {
    if (profile?.appIconUrl) {
      const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = profile.appIconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [profile?.appIconUrl]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalEarned = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
    const paidCount = invoices.filter(i => i.status === 'paid').length;
    const unpaidCount = invoices.filter(i => i.status === 'unpaid' || i.status === 'partial').length;
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const profit = totalEarned - totalExpenses;

    // Annual IFU calculation (0.5% of all invoices for the current year, paid or unpaid)
    const currentYear = new Date().getFullYear();
    const annualTotal = invoices
      .filter(inv => new Date(inv.date).getFullYear() === currentYear)
      .reduce((acc, inv) => acc + inv.total, 0);
    const annualIfu = invoices
      .filter(inv => new Date(inv.date).getFullYear() === currentYear)
      .reduce((acc, inv) => acc + (inv.taxAmount || 0), 0);
    const annualTva = invoices
      .filter(inv => new Date(inv.date).getFullYear() === currentYear)
      .reduce((acc, inv) => acc + (inv.isTvaNegative ? -(inv.tvaAmount || 0) : (inv.tvaAmount || 0)), 0);

    return {
      totalEarned,
      totalExpenses,
      profit,
      invoiceCount: invoices.length,
      paidCount,
      unpaidCount,
      annualTotal,
      annualIfu,
      annualTva
    };
  }, [invoices, expenses]);

  // Check for important dates and show notifications
  useEffect(() => {
    if (appState === 'ready' && profile) {
      const today = new Date();
      const currentYear = today.getFullYear();
      
      // IFU Deadline: June 30th
      const ifuDeadline = new Date(currentYear, 5, 30); // Month is 0-indexed, so 5 is June
      const casnosDeadline = new Date(currentYear, 5, 30);
      
      const diffIfu = Math.ceil((ifuDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffIfu > 0 && diffIfu <= 15) {
        setShowNotification({
          title: "Échéance Fiscale Proche",
          message: `Il reste ${diffIfu} jours pour déclarer et payer votre IFU et CASNOS (avant le 30 Juin).`
        });
      }
    }
  }, [appState, profile]);

  // Handlers
  const handleUpdateInvoiceStatus = async (invoiceId: string, status: 'paid' | 'unpaid' | 'partial', paidAmount?: number) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const updatedInvoice = { 
      ...invoice, 
      status,
      paidAmount: paidAmount !== undefined ? paidAmount : (status === 'paid' ? invoice.total : (status === 'unpaid' ? 0 : invoice.paidAmount))
    };

    setInvoices(invoices.map(i => i.id === invoiceId ? updatedInvoice : i));
    if (viewingInvoice?.id === invoiceId) setViewingInvoice(updatedInvoice);

    if (user && firebase.db) {
      try {
        await setDoc(doc(firebase.db, 'users', user.uid, 'invoices', invoiceId), updatedInvoice);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/invoices/${invoiceId}`, firebase.auth);
      }
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (client && profile) {
      try {
        await generateInvoicePDF(invoice, client, profile);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Erreur lors de la génération du PDF.');
      }
    } else {
      alert('Informations client ou technicien manquantes.');
    }
  };

  const handleShareInvoice = (invoice: Invoice, method: 'whatsapp' | 'email') => {
    const client = clients.find(c => c.id === invoice.clientId);
    if (!client || !profile) return;

    const docLabel = invoice.type === 'quote' ? 'Devis' : 'Facture';
    const amount = formatCurrency(invoice.total);

    if (method === 'whatsapp') {
      const message = encodeURIComponent(
        `Bonjour, voici votre ${docLabel.toLowerCase()} ${invoice.invoiceNumber} pour le projet ${invoice.projectName}.\n` +
        `Montant Total: ${amount}\n` +
        `Lien: ${window.location.href}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    } else {
      const subject = encodeURIComponent(`${docLabel} ${invoice.invoiceNumber} - ${invoice.projectName}`);
      const body = encodeURIComponent(
        `Bonjour,\n\nVeuillez trouver ci-joint les détails de votre ${docLabel.toLowerCase()}.\n\n` +
        `Numéro: ${invoice.invoiceNumber}\n` +
        `Projet: ${invoice.projectName}\n` +
        `Montant Total: ${amount}\n\n` +
        `Cordialement,\n${profile.firstName} ${profile.lastName}`
      );
      window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      try {
        await logout();
        setUser(null);
        setProfile(null);
        setInvoices([]);
        setClients([]);
        localStorage.clear();
        setAppState('setup-profile');
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const handleSaveProfile = async (newProfile: Technician) => {
    if (!user) return;
    const updatedProfile = { ...profile, ...newProfile, id: user.uid };
    setProfile(updatedProfile as UserProfile);
    
    if (firebase.db) {
      try {
        await setDoc(doc(firebase.db, 'users', user.uid), updatedProfile);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`, firebase.auth);
      }
    }

    if (!updatedProfile.pinCode) {
      setAppState('setup-pin');
    } else {
      setAppState('ready');
    }
  };

  const handleSavePin = (pin: string) => {
    if (profile) {
      const updatedProfile = { ...profile, pinCode: pin };
      setProfile(updatedProfile);
      setAppState('ready');
    }
  };

  const handleUpdateIcon = (url: string) => {
    if (profile) {
      setProfile({ ...profile, appIconUrl: url });
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handlePayDeadline = (deadline: any) => {
    setEditingExpense({
      description: `Paiement ${deadline.title} (${deadline.type})`,
      category: 'fiscal',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      currency: profile?.defaultCurrency || 'DZD'
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (expenseData: any) => {
    if (!user || !firebase.db) return;

    if (editingExpense?.id) {
      const updatedExpenses = expenses.map(exp => exp.id === editingExpense.id ? { ...exp, ...expenseData } as Expense : exp);
      setExpenses(updatedExpenses);
      try {
        const expenseToSave = updatedExpenses.find(e => e.id === editingExpense.id);
        if (expenseToSave) {
          await setDoc(doc(firebase.db, 'users', user.uid, 'expenses', editingExpense.id), expenseToSave);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/expenses/${editingExpense.id}`, firebase.auth);
      }
    } else {
      const newExpense = {
        ...expenseData,
        id: Math.random().toString(36).substr(2, 9),
        technicianId: user.uid,
      } as Expense;
      setExpenses([newExpense, ...expenses]);
      try {
        await setDoc(doc(firebase.db, 'users', user.uid, 'expenses', newExpense.id), newExpense);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/expenses/${newExpense.id}`, firebase.auth);
      }
    }
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
      const updatedExpenses = expenses.filter(exp => exp.id !== id);
      setExpenses(updatedExpenses);
      if (user && firebase.db) {
        try {
          await deleteDoc(doc(firebase.db, 'users', user.uid, 'expenses', id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/expenses/${id}`, firebase.auth);
        }
      }
    }
  };

  const handleSaveInvoice = async (invoiceData: any) => {
    let finalInvoiceData = { ...invoiceData };
    
    // Handle inline client creation
    if (invoiceData.newClientData) {
      const newClient = invoiceData.newClientData as Client;
      const updatedClients = [newClient, ...clients];
      setClients(updatedClients);
      
      if (user && firebase.db) {
        try {
          await setDoc(doc(firebase.db, 'users', user.uid, 'clients', newClient.id), newClient);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/clients/${newClient.id}`, firebase.auth);
        }
      }
      
      delete finalInvoiceData.newClientData;
      delete finalInvoiceData.isNewClient;
      delete finalInvoiceData.newClient;
    }

    if (editingInvoice?.id) {
      const updatedInvoices = invoices.map(inv => inv.id === editingInvoice.id ? { ...inv, ...finalInvoiceData, technicianId: user?.uid || inv.technicianId } as Invoice : inv);
      setInvoices(updatedInvoices);
      
      if (user && firebase.db) {
        try {
          const invoiceToSave = updatedInvoices.find(i => i.id === editingInvoice.id);
          if (invoiceToSave) {
            await setDoc(doc(firebase.db, 'users', user.uid, 'invoices', editingInvoice.id), invoiceToSave);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/invoices/${editingInvoice.id}`, firebase.auth);
        }
      }
    } else {
      const newInvoice = {
        ...finalInvoiceData,
        id: Math.random().toString(36).substr(2, 9),
        technicianId: user?.uid || 'default',
      } as Invoice;
      setInvoices([newInvoice, ...invoices]);
      
      if (user && firebase.db) {
        try {
          await setDoc(doc(firebase.db, 'users', user.uid, 'invoices', newInvoice.id), newInvoice);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/invoices/${newInvoice.id}`, firebase.auth);
        }
      }
    }
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    if (editingClient?.id) {
      const updatedClients = clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } as Client : c);
      setClients(updatedClients);
      
      if (user && firebase.db) {
        try {
          const clientToSave = updatedClients.find(c => c.id === editingClient.id);
          if (clientToSave) {
            await setDoc(doc(firebase.db, 'users', user.uid, 'clients', editingClient.id), clientToSave);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/clients/${editingClient.id}`, firebase.auth);
        }
      }
    } else {
      const newClient = {
        ...clientData,
        id: Math.random().toString(36).substr(2, 9),
      } as Client;
      setClients([newClient, ...clients]);
      
      if (user && firebase.db) {
        try {
          await setDoc(doc(firebase.db, 'users', user.uid, 'clients', newClient.id), newClient);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/clients/${newClient.id}`, firebase.auth);
        }
      }
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      setInvoices(invoices.filter(i => i.id !== invoice.id));
      if (user && firebase.db) {
        try {
          const { deleteDoc, doc } = await import('firebase/firestore');
          await deleteDoc(doc(firebase.db, 'users', user.uid, 'invoices', invoice.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/invoices/${invoice.id}`, firebase.auth);
        }
      }
    }
  };

  const handleDeleteClient = async (client: Client) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setClients(clients.filter(c => c.id !== client.id));
      if (user && firebase.db) {
        try {
          const { deleteDoc, doc } = await import('firebase/firestore');
          await deleteDoc(doc(firebase.db, 'users', user.uid, 'clients', client.id));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/clients/${client.id}`, firebase.auth);
        }
      }
    }
  };

  const handleExportData = () => {
    const data = { profile, invoices, clients };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech_dz_backup_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const handleClearData = () => {
    if (window.confirm('ATTENTION: Cela supprimera TOUTES vos données. Continuer ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleImportData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile && data.invoices && data.clients) {
        if (window.confirm('Voulez-vous vraiment importer ces données ? Cela écrasera vos données actuelles.')) {
          setProfile(data.profile);
          setInvoices(data.invoices);
          setClients(data.clients);
          alert('Données importées avec succès !');
          window.location.reload();
        }
      } else {
        alert('Format de fichier invalide.');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Erreur lors de l\'importation du fichier.');
    }
  };

  if (appState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="text-sm font-medium text-zinc-500">Chargement de Tech DZ Pro...</p>
        </div>
      </div>
    );
  }

  if (appState === 'onboarding') {
    return <Onboarding onNext={() => setAppState('setup-profile')} />;
  }

  if (appState === 'setup-profile') return <ProfileSetup onSave={handleSaveProfile} initialEmail="" />;
  if (appState === 'setup-pin') return <PinSetup onSave={handleSavePin} />;
  if (appState === 'locked' && profile?.pinCode) return <PinLock correctPin={profile.pinCode} onSuccess={() => setAppState('ready')} />;

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        appIconUrl={profile?.appIconUrl}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onLogout={handleLogout}
      >
        {activeTab === 'dashboard' && profile && (
          <Dashboard 
            stats={stats} 
            invoices={invoices}
            clients={clients}
            technician={profile}
            onCreateInvoice={() => {
              setEditingInvoice(null);
              setIsInvoiceModalOpen(true);
            }} 
            onPayDeadline={handlePayDeadline}
          />
        )}
        {activeTab === 'invoices' && (
          <InvoiceList
            invoices={invoices}
            clients={clients}
            onView={(inv) => {
              setViewingInvoice(inv);
              setIsPreviewModalOpen(true);
            }}
            onEdit={(inv) => {
              setEditingInvoice(inv);
              setIsInvoiceModalOpen(true);
            }}
            onDownload={handleDownloadInvoice}
            onShare={handleShareInvoice}
            onDelete={handleDeleteInvoice}
            onStatusChange={(inv, status) => handleUpdateInvoiceStatus(inv.id, status)}
            onCreate={() => {
              setEditingInvoice(null);
              setIsInvoiceModalOpen(true);
            }}
          />
        )}
        {activeTab === 'clients' && (
          <ClientList
            clients={clients}
            onAdd={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            onEdit={(client) => {
              setEditingClient(client);
              setIsClientModalOpen(true);
            }}
            onDelete={handleDeleteClient}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onAdd={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDelete={handleDeleteExpense}
          />
        )}
        {activeTab === 'profile' && profile && (
          <Profile
            profile={profile}
            user={user}
            isSyncing={isSyncing}
            onSave={handleSaveProfile}
            onUpdateSignature={() => setIsSignatureModalOpen(true)}
            onDeleteSignature={() => {
              if (window.confirm('Supprimer la signature ?')) {
                const updatedProfile = { ...profile, signatureUrl: undefined };
                setProfile(updatedProfile as UserProfile);
                if (user && firebase.db) {
                  setDoc(doc(firebase.db, 'users', user.uid), updatedProfile)
                    .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`, firebase.auth));
                }
              }
            }}
            onUpdateStamp={() => setIsStampModalOpen(true)}
            onDeleteStamp={() => {
              if (window.confirm('Supprimer le cachet ?')) {
                const updatedProfile = { ...profile, stampUrl: undefined };
                setProfile(updatedProfile as UserProfile);
                if (user && firebase.db) {
                  setDoc(doc(firebase.db, 'users', user.uid), updatedProfile)
                    .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`, firebase.auth));
                }
              }
            }}
            onLogin={loginWithGoogle}
            onLogout={logout}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            pinCode={profile?.pinCode || ''}
            appIconUrl={profile?.appIconUrl}
            onUpdatePin={handleSavePin}
            onUpdateIcon={handleUpdateIcon}
            onClearData={handleClearData}
            onExportData={handleExportData}
            onImportData={handleImportData}
            canInstall={!!deferredPrompt}
            onInstall={handleInstallApp}
          />
        )}

        {/* Modals */}
        <Modal
          isOpen={!!showNotification}
          onClose={() => setShowNotification(null)}
          title={showNotification?.title || ""}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4 text-amber-600">
              <Bell className="h-8 w-8" />
              <p className="text-lg font-bold">Rappel Important</p>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              {showNotification?.message}
            </p>
            <div className="pt-4">
              <Button onClick={() => setShowNotification(null)} className="w-full">
                J'ai compris
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title={editingInvoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
          size="full"
        >
          <InvoiceForm
            clients={clients}
            technician={profile!}
            initialData={editingInvoice || {}}
            onSave={handleSaveInvoice}
            onCancel={() => setIsInvoiceModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          title={editingClient ? 'Modifier le Client' : 'Nouveau Client'}
        >
          <ClientForm
            initialData={editingClient || {}}
            onSave={handleSaveClient}
            onCancel={() => setIsClientModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          title={editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
        >
          <ExpenseForm
            expense={editingExpense}
            defaultCurrency={profile?.defaultCurrency}
            onSave={handleSaveExpense}
            onCancel={() => setIsExpenseModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title="Aperçu de la Facture"
          size="full"
        >
          {viewingInvoice && (
            <InvoicePreview
              invoice={viewingInvoice}
              client={clients.find(c => c.id === viewingInvoice.clientId)!}
              technician={profile!}
              onClose={() => setIsPreviewModalOpen(false)}
              onStatusChange={(status) => handleUpdateInvoiceStatus(viewingInvoice.id, status)}
            />
          )}
        </Modal>

        <Modal
          isOpen={isSignatureModalOpen}
          onClose={() => setIsSignatureModalOpen(false)}
          title="Signature Numérique"
        >
          <SignaturePad
            onSave={(url) => {
              if (profile) setProfile({ ...profile, signatureUrl: url });
              setIsSignatureModalOpen(false);
            }}
            onCancel={() => setIsSignatureModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isStampModalOpen}
          onClose={() => setIsStampModalOpen(false)}
          title="Cachet Professionnel"
        >
          <StampPad
            onSave={(url) => {
              if (profile) setProfile({ ...profile, stampUrl: url });
              setIsStampModalOpen(false);
            }}
            onCancel={() => setIsStampModalOpen(false)}
          />
        </Modal>
      </Layout>
    </ErrorBoundary>
  );
}
