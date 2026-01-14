
export enum ExhibitCategory {
  VIOLENCE = 'VIOLENCE',
  SUBSTANCE = 'SUBSTANCE',
  OBSTRUCTION = 'OBSTRUCTION',
  CUSTODY = 'CUSTODY',
  FINANCIAL = 'FINANCIAL',
  MEDICAL = 'MEDICAL',
  PERJURY = 'PERJURY',
  CONTEMPT = 'CONTEMPT',
  PARENTING = 'PARENTING',
  INTEGRITY = 'INTEGRITY'
}

export interface BestInterestMapping {
  factor: string;
  legalArgument: string;
}

export interface Exhibit {
  id: string;
  exhibitNumber: string;
  date: string;
  category: ExhibitCategory;
  description: string;
  legalRelevance: string; // References to Family Services Act s.17
  bestInterestMapping?: BestInterestMapping; // AI-driven s.17 factor mapping
  bestInterestFactor?: string; // Summary factor (e.g., 'Safety')
  reflection?: string; // The "Letter to Harper" content
  contradictionNote?: string; // For the Perjury Tracker
  caption: string; 
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileHash?: string; // Digital fingerprint for Chain of Custody
  priority: number;
  witnesses: string[]; // ['Jane', 'Emma', 'Self']
  isLocationVerified?: boolean;
  locationData?: { lat: number; lng: number; accuracy: string };
  transcript?: string; 
  status: 'pending' | 'processed' | 'flagged';
  perjuryFlag?: boolean;
}

export interface Incident {
  id: string;
  date: string;
  category: ExhibitCategory;
  witness: string;
  priority: number;
  perjuryFlag?: boolean;
  legalNarrative: string;
}

export interface CaseMetadata {
  caseNumber: string;
  parties: string;
  court: string;
  act: string;
}
