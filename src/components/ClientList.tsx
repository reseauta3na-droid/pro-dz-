import React from 'react';
import { motion } from 'motion/react';
import { Search, Plus, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onAdd, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Clients</h1>
          <p className="text-zinc-500">Gérez vos contacts et sociétés partenaires.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher un client..."
            icon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <Card key={client.id} className="group flex flex-col justify-between hover:border-emerald-200 hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <span className="text-lg font-black">{client.name.charAt(0)}</span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(client)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(client)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="mb-4 text-lg font-bold text-zinc-900">{client.name}</h3>

                <div className="space-y-2 text-sm text-zinc-500">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span className="line-clamp-1">{client.address}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-100 pt-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <span>NIF: {client.nif || 'N/A'}</span>
                  <span>NIS: {client.nis || 'N/A'}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Aucun client trouvé</h3>
            <p className="text-zinc-500">Commencez par ajouter votre premier client.</p>
          </div>
        )}
      </div>
    </div>
  );
};
