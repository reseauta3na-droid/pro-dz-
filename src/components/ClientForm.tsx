import React from 'react';
import { User, Mail, Phone, MapPin, FileText, Save, CreditCard } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Client } from '../types';

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSave: (client: Partial<Client>) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = React.useState<Partial<Client>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    nif: initialData?.nif || '',
    nis: initialData?.nis || '',
    bankAccount: initialData?.bankAccount || '',
    additionalInfo: initialData?.additionalInfo || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nom du Client / Société"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        icon={<User className="h-4 w-4" />}
        placeholder="ex: SARL Production Cinéma"
        required
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail className="h-4 w-4" />}
          placeholder="client@example.com"
        />
        <Input
          label="Téléphone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          icon={<Phone className="h-4 w-4" />}
          placeholder="05 / 06 / 07 ..."
        />
      </div>

      <Input
        label="Adresse"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        icon={<MapPin className="h-4 w-4" />}
        placeholder="Adresse complète"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="NIF"
          value={formData.nif}
          onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
          icon={<FileText className="h-4 w-4" />}
          placeholder="Numéro d'Identification Fiscale"
        />
        <Input
          label="NIS"
          value={formData.nis}
          onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
          icon={<FileText className="h-4 w-4" />}
          placeholder="Numéro d'Identification Statistique"
        />
      </div>

      <Input
        label="Numéro de Compte Bancaire (RIB/CCP)"
        value={formData.bankAccount}
        onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
        icon={<CreditCard className="h-4 w-4" />}
        placeholder="ex: 007 99999 0000123456 78"
      />

      <Input
        label="Informations Supplémentaires"
        value={formData.additionalInfo}
        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
        icon={<FileText className="h-4 w-4" />}
        placeholder="Autres informations..."
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      </div>
    </form>
  );
};
