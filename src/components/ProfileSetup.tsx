import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, FileText, Shield, Save, UserPlus, CreditCard, Briefcase } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Technician } from '../types';

interface ProfileSetupProps {
  onSave: (profile: Technician) => void;
  initialEmail: string;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave, initialEmail }) => {
  const [formData, setFormData] = React.useState<Technician>({
    id: '',
    firstName: '',
    lastName: '',
    fonction: '',
    address: '',
    phone: '',
    email: initialEmail,
    nif: '',
    carteAutoentrepreneur: '',
    socialSecurity: '',
    bankAccount: '',
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid gap-6 sm:grid-cols-2">
              <Input
                label="Numéro NIF"
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                icon={<FileText className="h-4 w-4" />}
                required
              />
              <Input
                label="N° Carte Auto-entrepreneur"
                value={formData.carteAutoentrepreneur || ''}
                onChange={(e) => setFormData({ ...formData, carteAutoentrepreneur: e.target.value })}
                icon={<FileText className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
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

            <Button type="submit" className="w-full py-4 text-lg" size="lg">
              <Save className="mr-2 h-6 w-6" />
              Finaliser le profil
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
