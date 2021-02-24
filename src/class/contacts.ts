import { EncryptedContact } from "@/models/contact";
import { DB } from "./db";

class Contacts extends DB {
    // Inherit from DB class
    constructor() {
        super();
    }

    addContact(contact: EncryptedContact) {
        this.contacts.add(contact, contact.id);
    }    
}

export default new Contacts();