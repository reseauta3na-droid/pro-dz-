import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, FileText, Shield, Save, Camera, CreditCard, Briefcase, LogIn, LogOut, Cloud, CloudOff, Trash2, Edit2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Technician } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileProps {
  profile: Technician;
  user: FirebaseUser | null;
  isSyncing?: boolean;
  onSave: (profile: Technician) => void;
  onUpdateSignature: () => void;
  onDeleteSignature: () => void;
  onUpdateStamp: () => void;
  onDeleteStamp: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ 
  profile, 
  user, 
  isSyncing,
  onSave, 
  onUpdateSignature, 
  onDeleteSignature,
  onUpdateStamp,
  onDeleteStamp,
  onLogin,
  onLogout
}) => {
  const [formData, setFormData] = React.useState<Technician>(profile);

  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Profil Technicien</h1>
          <p className="text-zinc-500">Gérez vos informations professionnelles fixes.</p>
        </div>
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
                {isSyncing ? (
                  <Cloud className="h-4 w-4 text-emerald-500 animate-pulse" />
                ) : (
                  <Cloud className="h-4 w-4 text-emerald-500" />
                )}
                <span className="text-xs font-bold text-emerald-700">Cloud Sync Actif</span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout} className="text-red-500 border-red-100 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onLogin} className="bg-emerald-600 hover:bg-emerald-700">
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter au Cloud
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <Input
                  label="Prénom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  icon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  icon={<User className="h-4 w-4" />}
                />
                <Input
                  label="Fonction"
                  value={formData.fonction || ''}
                  onChange={(e) => setFormData({ ...formData, fonction: e.target.value })}
                  icon={<Briefcase className="h-4 w-4" />}
                  placeholder="ex: Chef Opérateur Son"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="h-4 w-4" />}
                />
                <Input
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>

              <Input
                label="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                icon={<MapPin className="h-4 w-4" />}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Devise par défaut</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <select
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-3 pl-12 pr-4 text-sm font-bold transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 text-zinc-900"
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value as any })}
                  >
                    <option value="DZD">DZD (Dinar Algérien)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar US)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Statut Légal</label>
                  <div className="flex rounded-xl bg-zinc-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, legalStatus: 'auto-entrepreneur' })}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${formData.legalStatus === 'auto-entrepreneur' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Auto-entrepreneur
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, legalStatus: 'registre-commerce' })}
                      className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${formData.legalStatus === 'registre-commerce' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                    >
                      Registre de Commerce
                    </button>
                  </div>
                </div>
                <Input
                  label="Numéro NIF"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  icon={<FileText className="h-4 w-4" />}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {formData.legalStatus === 'auto-entrepreneur' ? (
                  <Input
                    label="N° Carte Auto-entrepreneur"
                    value={formData.carteAutoentrepreneur || ''}
                    onChange={(e) => setFormData({ ...formData, carteAutoentrepreneur: e.target.value })}
                    icon={<FileText className="h-4 w-4" />}
                  />
                ) : (
                  <Input
                    label="N° Registre de Commerce (RC)"
                    value={formData.registreCommerce || ''}
                    onChange={(e) => setFormData({ ...formData, registreCommerce: e.target.value })}
                    icon={<FileText className="h-4 w-4" />}
                    placeholder="ex: 16/00-1234567B20"
                  />
                )}
                <Input
                  label="Sécurité Sociale (Optionnel)"
                  value={formData.socialSecurity}
                  onChange={(e) => setFormData({ ...formData, socialSecurity: e.target.value })}
                  icon={<Shield className="h-4 w-4" />}
                />
                <Input
                  label="Numéro de Compte Bancaire (RIB/CCP)"
                  value={formData.bankAccount || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  icon={<CreditCard className="h-4 w-4" />}
                  placeholder="ex: 007 99999 0000123456 78"
                />
              </div>

              <Input
                label="Informations Supplémentaires"
                value={formData.additionalInfo || ''}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                icon={<FileText className="h-4 w-4" />}
                placeholder="Autres informations..."
              />

              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Save className="mr-2 h-5 w-5" />
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Signature & Stamp */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Signature Numérique</h3>
            <div className="relative aspect-video rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
              {profile.signatureUrl ? (
                <img src={profile.signatureUrl} alt="Signature" className="h-full w-full object-contain p-4" />
              ) : (
                <div className="text-center">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-400">Aucune signature</p>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex space-x-2">
                {profile.signatureUrl && (
                  <button 
                    onClick={onDeleteSignature}
                    className="rounded-full bg-white p-2 shadow-lg hover:bg-red-50 transition-colors"
                    title="Supprimer la signature"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
                <button 
                  onClick={onUpdateSignature}
                  className="rounded-full bg-white p-2 shadow-lg hover:bg-zinc-50 transition-colors"
                  title="Modifier la signature"
                >
                  <Edit2 className="h-4 w-4 text-zinc-600" />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Cachet Professionnel</h3>
            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
              {profile.stampUrl ? (
                <img src={profile.stampUrl} alt="Cachet" className="h-full w-full object-contain p-4" />
              ) : (
                <div className="text-center">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                  <p className="text-xs font-medium text-zinc-400">Aucun cachet</p>
                </div>
              )}
              <div className="absolute bottom-3 right-3 flex space-x-2">
                {profile.stampUrl && (
                  <button 
                    onClick={onDeleteStamp}
                    className="rounded-full bg-white p-2 shadow-lg hover:bg-red-50 transition-colors"
                    title="Supprimer le cachet"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
                <button 
                  onClick={onUpdateStamp}
                  className="rounded-full bg-white p-2 shadow-lg hover:bg-zinc-50 transition-colors"
                  title="Modifier le cachet"
                >
                  <Edit2 className="h-4 w-4 text-zinc-600" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
