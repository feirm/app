// This DB class will be a subclass of Dexie - the IndexedDB for data storage
import Dexie from "dexie";

import { EncryptedAccount } from "@/models/account";
import { EncryptedContact } from "@/models/contact";

class DB extends Dexie {
  // Tables
  account: Dexie.Table<EncryptedAccount>;
  contacts: Dexie.Table<EncryptedContact>;

  // Initialise the constructor
  constructor() {
    super("feirm");
    this.version(1).stores({
      account: 'username',
      contacts: 'id, cipherText, iv'
    })

    // Assign our tables
    this.account = this.table("account");
    this.contacts = this.table("contacts");
  }
}

export {
  DB
};
