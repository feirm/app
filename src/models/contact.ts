// Representation of an encrypted contact stored by the API
interface EncryptedContact {
  id: string;
  cipherText: string;
  iv: string;
}

// Contact in its decrypted form
interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailAddress: string;
}

// Exports
export {
  EncryptedContact,
  Contact
}