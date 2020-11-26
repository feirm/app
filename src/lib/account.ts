import * as argon2 from "argon2-browser";
import bufferToHex from "@/lib/bufferToHex";
import * as nacl from "tweetnacl";
import aes from "aes-js";

interface Account {
  Username: string;
  Email: string;
  RootPasswordSalt: string;
  RootPublicKey: string;
  EncryptedRootKey: {
    CipherText: string;
    Iv: string;
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

  // Derive secret key from password
  const secretKey = await argon2.hash({
    pass: password,
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
  });

  // Generate a signing ed25519 keypair from a seed (secretKey)
  const rootKeyPair = nacl.sign.keyPair.fromSeed(secretKey.hash);

  // Create Salt for RootKey encryption
  const rootKeySalt = window.crypto.getRandomValues(new Uint8Array(16));

  // Encrypt RootKey Secret with AES-256-CBC using the secretKey
  const aesCBC = new aes.ModeOfOperation.cbc(secretKey.hash, rootKeySalt);
  const cipherText = aesCBC.encrypt(rootKeyPair.secretKey);

  const account = {
    Username: username,
    Email: email,
    RootPasswordSalt: bufferToHex(saltArray),
    RootPublicKey: bufferToHex(rootKeyPair.publicKey),
    EncryptedRootKey: {
      CipherText: aes.utils.hex.fromBytes(cipherText),
      Iv: bufferToHex(rootKeySalt),
    },
  } as Account;

  return account;
}

export { generateAccount };
