import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, FileText, Shield, Save, UserPlus, CreditCard, Briefcase } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Technician } from '../types';

interface ProfileSetupProps {
  onSave: (profile: Technician) => void;
  onLogin: () => void;
  initialEmail: string;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave, onLogin, initialEmail }) => {
  const [formData, setFormData] = React.useState<Technician>({
    id: '',
    firstName: '',
    lastName: '',
    fonction: '',
    legalStatus: 'auto-entrepreneur',
    address: '',
    phone: '',
    email: initialEmail,
    nif: '',
    registreCommerce: '',
    carteAutoentrepreneur: '',
    socialSecurity: '',
    bankAccount: '',
    additionalInfo: '',
    defaultCurrency: 'DZD',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
            <UserPlus className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Configurez votre profil</h1>
          <p className="text-zinc-500">Ces informations apparaîtront sur vos factures.</p>
        </div>

        <Card className="p-8 shadow-xl shadow-zinc-200/50">
          <form onSubmit={handleSubmit} className="space-y-6 pb-32">
            <div className="grid gap-6 sm:grid-cols-3">
              <Input
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                icon={<User className="h-4 w-4" />}
                required
              />
              <Input
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                icon={<User className="h-4 w-4" />}
                required
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
                required
              />
              <Input
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={<Phone className="h-4 w-4" />}
                required
              />
            </div>

            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              icon={<MapPin className="h-4 w-4" />}
              required
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
                required
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
            </div>

            <Input
              label="Numéro de Compte Bancaire (RIB/CCP)"
              value={formData.bankAccount || ''}
              onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
              icon={<CreditCard className="h-4 w-4" />}
              placeholder="ex: 007 99999 0000123456 78"
            />

            <Input
              label="Informations Supplémentaires"
              value={formData.additionalInfo || ''}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              icon={<FileText className="h-4 w-4" />}
              placeholder="Autres informations..."
            />

            <Button type="submit" className="w-full py-4 text-lg" size="lg">
              <Save className="mr-2 h-6 w-6" />
              Finaliser le profil
            </Button>
            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={onLogin}
                className="text-xs font-bold text-zinc-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
              >
                Déjà un compte ? Se connecter pour restaurer
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
