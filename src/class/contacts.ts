import { Contact, EncryptedContact } from "@/models/contact";
import { store } from "@/store";
import { DB } from "./db";
import aes from "aes-js";
import bufferToHex from "@/lib/bufferToHex";

class Contacts extends DB {
  // Add encrypted contact
  addContact(contact: EncryptedContact) {
    this.contacts.add(contact, contact.id);
  }

  // Delete encrypted contact
  deleteContact(contactId: string) {
    this.contacts.delete(contactId);
  }

  // Fetch all encrypted contacts
  async getEncryptedContacts(): Promise<EncryptedContact[]> {
    const contacts: EncryptedContact[] = [];

    await this.contacts.each((contact) => contacts.push(contact));

    return contacts;
  }

  // Encrypt a plaintext contact
  async encryptContact(contact: Contact): Promise<EncryptedContact> {
    // Plaintext contact needs to be stringified to JSON
    const jsonContact = JSON.stringify(contact);

    // Fetch accounts encryption keypair
    // TODO: Refactor this into its own method for user accounts
    // Derive account encryption key from rootkey
    const encryptionKey = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(store.getters.getRootKey + "enc")
    );

    // Generate an intialisation vector
    const contactIv = window.crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the contact JSON string
    const aesCBC = new aes.ModeOfOperation.cbc(
      new Uint8Array(encryptionKey),
      contactIv
    );

    const cipherText = await aesCBC.encrypt(
      aes.padding.pkcs7.pad(aes.utils.utf8.toBytes(jsonContact))
    );

    // Construct and return the encrypted contact payload
    const encryptedContact = {
      // id gets set later
      cipherText: bufferToHex(cipherText),
      iv: bufferToHex(contactIv),
    } as EncryptedContact;

    return encryptedContact;
  }

  // Decrypt a contact by its ID
  async decryptContact(contactId: string): Promise<Contact> {
    const contact = await this.contacts.get(contactId); // TODO: types

    // Fetch accounts encryption keypair
    // TODO: Refactor this into its own method for user accounts
    // Derive account encryption key from rootkey
    const encryptionKey = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(store.getters.getRootKey + "enc")
    );

    // Convert IV to hex bytes
    const iv = aes.utils.hex.toBytes(contact!.iv);

    // AES-256-CBC Decipher
    const aesCBC = new aes.ModeOfOperation.cbc(
      new Uint8Array(encryptionKey),
      iv
    );

    // Attempt to decrypt the ciphertext
    const decrypted = aesCBC.decrypt(
      aes.utils.hex.toBytes(contact!.cipherText)
    );
    const decryptedContact = JSON.parse(
      aes.utils.utf8.fromBytes(aes.padding.pkcs7.strip(decrypted))
    );

    // Set the contact ID again on the newly decrypted contact
    decryptedContact.id = contactId;

    return decryptedContact as Contact;
  }
}

export default new Contacts();
