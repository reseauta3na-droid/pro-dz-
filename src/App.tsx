import React, { useState, useEffect, useMemo } from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { Invoice, Client, Technician, UserProfile } from './types';
import { startOfMonth, endOfMonth, format, isWithinInterval, subMonths } from 'date-fns';

type AppState = 'loading' | 'setup-profile' | 'setup-pin' | 'locked' | 'ready';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
    const unpaidCount = invoices.filter(i => i.status === 'unpaid').length;

    // Annual IFU calculation (0.5% of all invoices for the current year, paid or unpaid)
    const currentYear = new Date().getFullYear();
    const annualTotal = invoices
      .filter(inv => new Date(inv.date).getFullYear() === currentYear)
      .reduce((acc, inv) => acc + inv.total, 0);
    const annualIfu = annualTotal * 0.005;

    // Last 6 months data
    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const monthName = format(date, 'MMM');
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const amount = invoices
        .filter(inv => {
          const invDate = new Date(inv.date);
          return isWithinInterval(invDate, { start, end }) && inv.status === 'paid';
        })
        .reduce((acc, inv) => acc + inv.total, 0);

      return { month: monthName, amount };
    });

    return {
      totalEarned,
      invoiceCount: invoices.length,
      paidCount,
      unpaidCount,
      annualTotal,
      annualIfu,
      monthlyData
    };
  }, [invoices]);

  // Handlers
  const handleSaveProfile = (newProfile: Technician) => {
    const updatedProfile = { ...profile, ...newProfile };
    setProfile(updatedProfile as UserProfile);
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

  const handleSaveInvoice = (invoiceData: any) => {
    let finalInvoiceData = { ...invoiceData };
    
    // Handle inline client creation
    if (invoiceData.newClientData) {
      const newClient = invoiceData.newClientData as Client;
      setClients([newClient, ...clients]);
      delete finalInvoiceData.newClientData;
      delete finalInvoiceData.isNewClient;
      delete finalInvoiceData.newClient;
    }

    if (editingInvoice?.id) {
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? { ...inv, ...finalInvoiceData } as Invoice : inv));
    } else {
      const newInvoice = {
        ...finalInvoiceData,
        id: Math.random().toString(36).substr(2, 9),
        technicianId: profile?.id || 'default',
      } as Invoice;
      setInvoices([newInvoice, ...invoices]);
    }
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingClient?.id) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } as Client : c));
    } else {
      const newClient = {
        ...clientData,
        id: Math.random().toString(36).substr(2, 9),
      } as Client;
      setClients([newClient, ...clients]);
    }
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      setInvoices(invoices.filter(i => i.id !== invoice.id));
    }
  };

  const handleDeleteClient = (client: Client) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setClients(clients.filter(c => c.id !== client.id));
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

  if (appState === 'loading') return <div className="flex h-screen items-center justify-center bg-zinc-50">Chargement...</div>;
  if (appState === 'setup-profile') return <ProfileSetup onSave={handleSaveProfile} initialEmail="" />;
  if (appState === 'setup-pin') return <PinSetup onSave={handleSavePin} />;
  if (appState === 'locked' && profile?.pinCode) return <PinLock correctPin={profile.pinCode} onSuccess={() => setAppState('ready')} />;

  return (
    <ErrorBoundary>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        appIconUrl={profile?.appIconUrl}
      >
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            invoices={invoices}
            clients={clients}
            onCreateInvoice={() => {
              setEditingInvoice(null);
              setIsInvoiceModalOpen(true);
            }} 
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
            onDownload={(inv) => {
              setViewingInvoice(inv);
              setIsPreviewModalOpen(true);
            }}
            onDelete={handleDeleteInvoice}
            onStatusChange={(inv, status) => {
              setInvoices(invoices.map(i => i.id === inv.id ? { 
                ...i, 
                status,
                paidAmount: status === 'paid' ? i.total : (status === 'unpaid' ? 0 : i.paidAmount)
              } : i));
            }}
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
        {activeTab === 'profile' && profile && (
          <Profile
            profile={profile}
            onSave={handleSaveProfile}
            onUpdateSignature={() => setIsSignatureModalOpen(true)}
            onUpdateStamp={() => setIsStampModalOpen(true)}
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
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          title={editingInvoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
          size="full"
        >
          <InvoiceForm
            clients={clients}
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
              onStatusChange={(status) => {
                const updatedInvoice = { 
                  ...viewingInvoice, 
                  status,
                  paidAmount: status === 'paid' ? viewingInvoice.total : (status === 'unpaid' ? 0 : viewingInvoice.paidAmount)
                };
                setInvoices(invoices.map(i => i.id === viewingInvoice.id ? updatedInvoice : i));
                setViewingInvoice(updatedInvoice);
              }}
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
