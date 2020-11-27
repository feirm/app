import * as argon2 from "argon2-browser";
import bufferToHex from "@/lib/bufferToHex";
import * as nacl from "tweetnacl";
import aes from "aes-js";

interface Account {
  username: string;
  email: string;
  rootPasswordSalt: string;
  rootPublicKey: string;
  encryptedRootKey: {
    cipherText: string;
    iv: string;
  };
}

async function generateAccount(
  username: string,
  email: string,
  password: string
): Promise<Account> {
  // Generate 16 random bytes of salt
  const saltArray: Uint8Array = new Uint8Array(16);
  const salt = window.crypto.getRandomValues(saltArray);

  // Derive secret key from password (this is to be used for encryption)
  const secretKey = await argon2.hash({
    pass: password,
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
  });

  // Generate the account key root, and subsequent identity key
  // The rootKey is to be encrypted with secretKey
  const rootKey: Uint8Array = window.crypto.getRandomValues(new Uint8Array(32));

  const identityKeyString = bufferToHex(rootKey) + "identity";
  const identityKey = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(identityKeyString));

  // Generate a signing ed25519 keypair from a seed (identityKey)
  const rootKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(identityKey));

  // Create Salt for RootKey encryption
  const rootKeySalt = window.crypto.getRandomValues(new Uint8Array(16));

  // Encrypt rootKey with AES-256-CBC using the secretKey and rootKeySalt
  const aesCBC = new aes.ModeOfOperation.cbc(secretKey.hash, rootKeySalt);
  const cipherText = aesCBC.encrypt(rootKey);

  const account = {
    username: username,
    email: email,
    rootPasswordSalt: bufferToHex(saltArray),
    rootPublicKey: bufferToHex(rootKeyPair.publicKey),
    encryptedRootKey: {
      cipherText: aes.utils.hex.fromBytes(cipherText),
      iv: bufferToHex(rootKeySalt),
    },
  } as Account;

  return account;
}

export { generateAccount };
