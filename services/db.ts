
import Dexie, { type Table } from 'dexie';
import { Exhibit } from '../types';

/**
 * LegalDatabase manages the indexedDB storage for exhibits and forensic data.
 * Using the default import for Dexie ensures that inherited members like .version() 
 * are correctly identified by the TypeScript compiler on the child class.
 */
export class LegalDatabase extends Dexie {
  exhibits!: Table<Exhibit>;

  constructor() {
    super('LegalExhibitPro');
    // Define schema version and stores using the inherited version method
    this.version(1).stores({
      exhibits: 'id, exhibitNumber, category, date, priority, perjuryFlag'
    });
  }
}

export const db = new LegalDatabase();
