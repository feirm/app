// This DB class will be a subclass of Dexie - the IndexedDB for data storage
import Dexie from "dexie";

import { EncryptedAccount } from "@/models/account";
import { EncryptedContact } from "@/models/contact";
import { Wallet } from "@/models/wallet";

class DB extends Dexie {
  // Tables
  account: Dexie.Table<EncryptedAccount>;
  contacts: Dexie.Table<EncryptedContact>;
  wallets: Dexie.Table<Wallet>;

  // Initialise the constructor
  constructor() {
    super("feirm");
    this.version(1).stores({
      account: 'username',
      contacts: 'id, cipherText, iv',
      wallets: 'name'
    })

    // Assign our tables
    this.account = this.table("account");
    this.contacts = this.table("contacts");
  }

  // Clear the IDB store
  clearData() {
    this.account.clear();
    this.contacts.clear();
    this.wallets.clear();
  }
}

export {
  DB
};
