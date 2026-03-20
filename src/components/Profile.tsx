import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, FileText, Shield, Save, Camera, CreditCard, Briefcase } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Technician } from '../types';

interface ProfileProps {
  profile: Technician;
  onSave: (profile: Technician) => void;
  onUpdateSignature: () => void;
  onUpdateStamp: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, onSave, onUpdateSignature, onUpdateStamp }) => {
  const [formData, setFormData] = React.useState<Technician>(profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Profil Technicien</h1>
        <p className="text-zinc-500">Gérez vos informations professionnelles fixes.</p>
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

              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Numéro NIF"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                  icon={<FileText className="h-4 w-4" />}
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
              <button 
                onClick={onUpdateSignature}
                className="absolute bottom-3 right-3 rounded-full bg-white p-2 shadow-lg hover:bg-zinc-50 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-zinc-600" />
              </button>
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
              <button 
                onClick={onUpdateStamp}
                className="absolute bottom-3 right-3 rounded-full bg-white p-2 shadow-lg hover:bg-zinc-50 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-zinc-600" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

function Edit2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
