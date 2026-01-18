
import Dexie, { type Table } from 'dexie';
import { Exhibit, CommunicationEntry } from '../types';

/**
 * LegalDatabase manages the indexedDB storage for exhibits and forensic data.
 */
export class LegalDatabase extends Dexie {
  exhibits!: Table<Exhibit>;
  communicationLogs!: Table<CommunicationEntry>;

  constructor() {
    super('LegalExhibitPro');
    
    // Explicitly defining the database schema versions.
    // this.version() is a method inherited from Dexie for schema definition.
    this.version(2).stores({
      exhibits: 'id, exhibitNumber, category, date, priority, perjuryFlag',
      communicationLogs: 'id, timestamp, sender, receiver, platform'
    });
  }
}

export const db = new LegalDatabase();
