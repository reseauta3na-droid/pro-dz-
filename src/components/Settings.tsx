import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Bell, Cloud, Database, Trash2, Save, Key, Image as ImageIcon, Sparkles, Loader2, Download as DownloadIcon } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { generateAppIcon } from '../services/imageService';

interface SettingsProps {
  pinCode: string;
  appIconUrl?: string;
  canInstall?: boolean;
  onUpdatePin: (pin: string) => void;
  onUpdateIcon: (url: string) => void;
  onInstall?: () => void;
  onClearData: () => void;
  onExportData: () => void;
  onImportData: (data: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  pinCode,
  appIconUrl,
  canInstall,
  onUpdatePin,
  onUpdateIcon,
  onInstall,
  onClearData,
  onExportData,
  onImportData,
}) => {
  const [newPin, setNewPin] = React.useState(pinCode);
  const [isGeneratingIcon, setIsGeneratingIcon] = React.useState(false);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePin(newPin);
  };

  const handleGenerateIcon = async () => {
    setIsGeneratingIcon(true);
    try {
      const iconUrl = await generateAppIcon("A professional, modern, minimalist app icon for 'TECH DZ PRO'. The icon should feature a stylized emerald green 'T' and 'D' integrated with a technical circuit or gear element. The background should be a clean charcoal gray or white. High resolution, flat design, vector style.");
      if (iconUrl) {
        onUpdateIcon(iconUrl);
      }
    } catch (error) {
      console.error("Error generating icon:", error);
      alert("Erreur lors de la génération de l'icône. Veuillez réessayer.");
    } finally {
      setIsGeneratingIcon(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Paramètres</h1>
        <p className="text-zinc-500">Gérez la sécurité et les données de votre application.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Security Section */}
        <Card className="p-8">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Sécurité & Accès</h3>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-6">
            <Input
              label="Code PIN d'accès"
              type="password"
              maxLength={4}
              placeholder="ex: 1234"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              icon={<Key className="h-4 w-4" />}
            />
            <p className="text-xs text-zinc-500">
              Le code PIN protège l'accès à vos données financières sur cet appareil.
            </p>
            <Button type="submit" variant="outline" className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Mettre à jour le PIN
            </Button>
          </form>
        </Card>

        {/* Data Management Section */}
        <Card className="p-8">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Apparence</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-zinc-100 bg-zinc-50">
                {appIconUrl ? (
                  <img src={appIconUrl} alt="App Icon" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-zinc-300" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-zinc-900">Icône de l'application</h4>
                <p className="text-xs text-zinc-500">Personnalisez l'identité visuelle de Tech DZ Pro.</p>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGenerateIcon}
              disabled={isGeneratingIcon}
            >
              {isGeneratingIcon ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                  Générer une nouvelle icône
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Data Management Section */}
        <Card className="p-8">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-xl bg-zinc-100 p-2 text-zinc-600">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Gestion des Données</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <h4 className="font-bold text-zinc-900">Exporter les données</h4>
                <p className="text-xs text-zinc-500">Téléchargez une sauvegarde JSON.</p>
              </div>
              <Button variant="outline" size="sm" onClick={onExportData}>
                Exporter
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div>
                <h4 className="font-bold text-zinc-900">Importer les données</h4>
                <p className="text-xs text-zinc-500">Restaurer à partir d'un fichier.</p>
              </div>
              <input
                type="file"
                id="import-data"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      onImportData(content);
                    };
                    reader.readAsText(file);
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={() => document.getElementById('import-data')?.click()}>
                Importer
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4">
              <div>
                <h4 className="font-bold text-red-900">Réinitialiser l'application</h4>
                <p className="text-xs text-red-500">Supprime toutes les données locales.</p>
              </div>
              <Button variant="danger" size="sm" onClick={onClearData}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Cloud Sync Section */}
        <Card className="p-8 lg:col-span-2">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
              <Cloud className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Synchronisation & Installation</h3>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-400">
                <Cloud className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900">Sauvegarde Automatique</h4>
              <p className="mx-auto max-w-xs text-zinc-500">
                Vos données sont synchronisées localement et peuvent être exportées pour sauvegarde.
              </p>
              <div className="mt-6 flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synchronisé</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 text-center border-t border-zinc-100 lg:border-t-0 lg:border-l lg:pl-8">
              <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-600">
                <DownloadIcon className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900">Installer l'application</h4>
              <p className="mx-auto max-w-xs text-zinc-500">
                Installez Tech DZ Pro sur votre téléphone pour un accès rapide et hors-ligne.
              </p>
              <Button 
                variant="primary" 
                className="mt-6 w-full max-w-xs" 
                onClick={onInstall}
                disabled={!canInstall}
              >
                {canInstall ? "Installer maintenant" : "Déjà installé ou non supporté"}
              </Button>
              {!canInstall && (
                <p className="mt-2 text-[10px] text-zinc-400">
                  Sur Android, utilisez Chrome et sélectionnez "Ajouter à l'écran d'accueil" dans le menu.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
