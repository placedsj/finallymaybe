
import { ExhibitCategory, CaseMetadata } from './types';

export const CASE_DEFAULTS: CaseMetadata = {
  caseNumber: 'FDSJ-739-2024',
  parties: 'Ryan v. Schulz',
  court: 'New Brunswick Family Court',
  act: 'Family Services Act SNB 2014 c.6'
};

export const CATEGORY_COLORS: Record<ExhibitCategory, string> = {
  [ExhibitCategory.VIOLENCE]: 'bg-red-100 text-red-700 border-red-200',
  [ExhibitCategory.SUBSTANCE]: 'bg-purple-100 text-purple-700 border-purple-200',
  [ExhibitCategory.OBSTRUCTION]: 'bg-orange-100 text-orange-700 border-orange-200',
  [ExhibitCategory.CUSTODY]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [ExhibitCategory.FINANCIAL]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [ExhibitCategory.MEDICAL]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  [ExhibitCategory.PERJURY]: 'bg-rose-100 text-rose-700 border-rose-200',
  [ExhibitCategory.CONTEMPT]: 'bg-amber-100 text-amber-700 border-amber-200',
  [ExhibitCategory.PARENTING]: 'bg-blue-100 text-blue-700 border-blue-200',
  [ExhibitCategory.INTEGRITY]: 'bg-slate-100 text-slate-700 border-slate-200',
};
