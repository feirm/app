import { EncryptedContact } from "@/models/contact";
import { DB } from "./db";

class Contacts extends DB {
    // Inherit from DB class
    constructor() {
        super();
    }

    addContact() {
        // Dummy data
        const contact: EncryptedContact = {
            id: '123456',
            cipherText: '0x0000',
            iv: '0x1234'
        };

        this.contacts.add(contact, contact.id);
    }    
}

export default new Contacts();