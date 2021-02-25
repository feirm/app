import { EncryptedContact } from "@/models/contact";
import { DB } from "./db";

class Contacts extends DB {
    // Inherit from DB class
    constructor() {
        super();
    }

    // Add encrypted contact
    addContact(contact: EncryptedContact) {
        this.contacts.add(contact, contact.id);
    }

    // Delete encrypted contact
    deleteContact(contactId: string) {
        this.contacts.delete(contactId);
    }

    // Fetch all encrypted contacts
    getEncryptedContacts(): EncryptedContact[] {
        const contacts: EncryptedContact[] = [];

        this.contacts.each(contact => contacts.push(contact));

        return contacts;
    }
}

export default new Contacts();