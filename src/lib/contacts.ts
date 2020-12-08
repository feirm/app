import { store } from "@/store";
import aes from "aes-js";
import bufferToHex from "./bufferToHex";

// Decrypted contact payload
interface Contact {
  FirstName: string;
  LastName: string;
  FeirmID: string;
  PhoneNumber: string;
  Email: string;
}

// Encrypted contact payload
interface EncryptedContact {
  cipherText: string;
  iv: string;
}

// Generate an encrypted contact payload
async function CreateEncryptedContact(
  contact: Contact
): Promise<EncryptedContact> {
  // Convert contact to JSON string
  const contactJSON = JSON.stringify(contact);

  // Derive account encryption key from rootkey
  const encryptionKeyString = store.getters.getRootKey + "enc";
  const encryptionKey = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(encryptionKeyString)
  );

  // Generate an intialisation vector
  const contactIv = window.crypto.getRandomValues(new Uint8Array(16));

  // Encrypt the contact JSON string
  const aesCBC = new aes.ModeOfOperation.cbc(
    new Uint8Array(encryptionKey),
    contactIv
  );
  const cipherText = await aesCBC.encrypt(
    aes.padding.pkcs7.pad(aes.utils.utf8.toBytes(contactJSON))
  );

  const encryptedContact = {
    cipherText: bufferToHex(cipherText),
    iv: bufferToHex(contactIv),
  } as EncryptedContact;
  return encryptedContact;
}

// Decrypt encrypted contacts
async function DecryptContacts(contacts: EncryptedContact[]): Promise<any> {
  // New list of decrypted contacts
  const decryptedContacts = [] as Contact[];

  // Derive account encryption key from rootkey
  const encryptionKey = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(store.getters.getRootKey + "enc")
  );

  // Attempt to decrypt each contact entry
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];

    // IV formatting
    const aesIv = aes.utils.hex.toBytes(contact.iv);

    // AES Decipher
    const aesCBC = new aes.ModeOfOperation.cbc(
      new Uint8Array(encryptionKey),
      aesIv
    );
    const decrypted = aesCBC.decrypt(aes.utils.hex.toBytes(contact.cipherText));

    const decryptedContact = JSON.parse(
      aes.utils.utf8.fromBytes(aes.padding.pkcs7.strip(decrypted))
    ) as Contact;

    // Push decrypted contact to array
    decryptedContacts.push(decryptedContact);
  }

  return decryptedContacts;
}

export { Contact, EncryptedContact, CreateEncryptedContact, DecryptContacts };
