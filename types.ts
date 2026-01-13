
export enum ExhibitCategory {
  VIOLENCE = 'Violence',
  SUBSTANCE = 'Substance',
  CONTEMPT = 'Contempt',
  FINANCIAL = 'Financial',
  PARENTING = 'Parenting',
  INTEGRITY = 'Integrity',
  MEDICAL = 'Medical'
}

export interface Exhibit {
  id: string;
  exhibitNum: string;
  date: string;
  category: ExhibitCategory;
  description: string;
  legalRelevance: string;
  caption: string;
  chainOfCustody: {
    source: string;
    dateObtained: string;
    custody: string;
    authentication: string;
    status: 'Ready' | 'Pending' | 'Draft';
  };
  fileData?: string; // base64
  fileName?: string;
}

export interface CaseMetadata {
  caseNumber: string;
  parties: string;
  court: string;
  act: string;
}
