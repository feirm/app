// This DB class will be a subclass of Dexie - the IndexedDB for data storage
import { EncryptedContact } from "@/models/contact";
import Dexie from "dexie";

class DB extends Dexie {
  db: Dexie;

  // Tables
  contacts: Dexie.Table<EncryptedContact>

  // Initialise the constructor
  constructor() {
    super("feirm");
    this.version(1).stores({
      contacts: 'id, cipherText, iv'
    })

    // Assign our tables
    this.contacts = this.table("contacts");
  }
}

export {
  DB
};
