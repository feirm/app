import { store } from "@/store";
import aes from "aes-js";
import bufferToHex from "./bufferToHex";

// Decrypted contact payload
interface Contact {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
  cryptoAddresses: CryptoAddress[];
}

// Interface for a contact cryptocurrency address
interface CryptoAddress {
  coin: string;
  address: string;
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
async function DecryptContacts(
  contacts: EncryptedContact[]
): Promise<Contact[]> {
  // New list of empty decrypted contacts
  const decryptedContacts = [] as Contact[];

  // Derive account encryption key from rootkey
  const encryptionKey = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(store.getters.getRootKey + "enc")
  );

  // Iterate over each item in the encrypted contacts array
  await contacts.forEach(async (contact) => {
    // Decrypt contact with AES
    try {
      // Convert IV to hex bytes
      const iv = aes.utils.hex.toBytes(contact.iv);

      // AES-256-CBC Decipher
      const aesCBC = new aes.ModeOfOperation.cbc(new Uint8Array(encryptionKey), iv);

      // Attempt to decrypt the ciphertext
      const decrypted = aesCBC.decrypt(aes.utils.hex.toBytes(contact.cipherText));
      const decryptedContact = JSON.parse(aes.utils.utf8.fromBytes(aes.padding.pkcs7.strip(decrypted)));

      // Push to array
      decryptedContacts.push(decryptedContact);
    } catch (e) {
      console.log("Decrypt error:", e);
    }
  });

  return decryptedContacts;
}

export {
  Contact,
  EncryptedContact,
  CryptoAddress,
  CreateEncryptedContact,
  DecryptContacts,
};
