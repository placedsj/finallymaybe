
import Dexie from 'dexie';
import type { Table } from 'dexie';
import { Exhibit } from '../types';

/**
 * LegalDatabase manages the indexedDB storage for exhibits and forensic data.
 */
export class LegalDatabase extends Dexie {
  exhibits!: Table<Exhibit>;

  constructor() {
    super('LegalExhibitPro');
    
    // Define the database schema using the version method inherited from the Dexie base class.
    // Fixed: Using default import for Dexie to ensure 'version' and other inherited members are correctly recognized by the TypeScript compiler.
    this.version(1).stores({
      exhibits: 'id, exhibitNumber, category, date, priority, perjuryFlag'
    });
  }
}

export const db = new LegalDatabase();
