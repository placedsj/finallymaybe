
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
  legalRelevance: string;
  bestInterestMapping?: BestInterestMapping;
  bestInterestFactor?: string;
  reflection?: string;
  contradictionNote?: string;
  caption: string; 
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileHash?: string;
  priority: number;
  witnesses: string[];
  status: 'pending' | 'processed' | 'flagged';
  perjuryFlag?: boolean;
}

export interface CommunicationEntry {
  id: string;
  timestamp: string;
  sender: string;
  receiver: string;
  content: string;
  platform: string; // 'SMS', 'WhatsApp', 'Email', 'Messenger'
  sentiment?: 'AGRESSIVE' | 'COOPERATIVE' | 'NEUTRAL';
  isFlagged?: boolean;
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
