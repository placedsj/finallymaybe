
import { Dexie, type Table } from 'dexie';
import { Exhibit } from '../types';

/**
 * LegalDatabase manages the indexedDB storage for exhibits and forensic data.
 */
export class LegalDatabase extends Dexie {
  exhibits!: Table<Exhibit>;

  constructor() {
    super('LegalExhibitPro');
    
    // Define the database schema using the version method inherited from the Dexie base class.
    // Using a named import for Dexie ensures the instance methods are correctly visible to TypeScript during inheritance.
    this.version(1).stores({
      exhibits: 'id, exhibitNumber, category, date, priority, perjuryFlag'
    });
  }
}

export const db = new LegalDatabase();
