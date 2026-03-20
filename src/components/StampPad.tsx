import React, { useRef, useState } from 'react';
import { Upload, X, Save, Camera } from 'lucide-react';
import { Button } from './ui/Button';

interface StampPadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export const StampPad: React.FC<StampPadProps> = ({ onSave, onCancel }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      onSave(preview);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative aspect-square w-48 overflow-hidden rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Stamp preview" className="h-full w-full object-contain p-4" />
          ) : (
            <div className="text-center">
              <Camera className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
              <p className="text-xs font-medium text-zinc-400">Aucun fichier</p>
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Choisir une image
        </Button>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Annuler
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!preview}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
};
