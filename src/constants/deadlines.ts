import { FiscalDeadline } from '../types';

export const FISCAL_DEADLINES: FiscalDeadline[] = [
  {
    id: 'g12-bis',
    title: "G12 bis",
    type: "IFU",
    date: "01-20", // MM-DD
    description: "Déclaration chiffre d'affaires réel"
  },
  {
    id: 'casnos-decl',
    title: "CASNOS Déclaration",
    type: "CASNOS",
    date: "02-28",
    description: "Déclaration revenu annuel"
  },
  {
    id: 'g12-paiement',
    title: "G12 + Paiement",
    type: "IFU",
    date: "06-30",
    description: "Déclaration prévisionnelle + paiement IFU"
  },
  {
    id: 'casnos-paiement',
    title: "CASNOS Paiement",
    type: "CASNOS",
    date: "06-30",
    description: "Paiement cotisation annuelle"
  }
];
