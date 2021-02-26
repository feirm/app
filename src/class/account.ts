import { DB } from "./db";
import { EncryptedAccount } from "@/models/account";
import { ArgonType, hash } from "argon2-browser";
import { ModeOfOperation } from "aes-js";
import { SignKeyPair, sign } from "tweetnacl";
import bufferToHex from "@/lib/bufferToHex";

// Different account key types
enum Keys {
  Identity = "identity",
  Encryption = "enc",
}

class Account extends DB {
  // Generate an encrypted account
  async generateAccount(
    username: string,
    password: string,
    pin: string
  ): Promise<EncryptedAccount> {
    // Generate 16 random bytes of salt.
    // This is to be used when stretching the password.
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    // Derive the stretched key from the password to be used for encryption
    const secretKey = await hash({
      pass: password,
      salt: salt,
      type: ArgonType.Argon2id,
      hashLen: 32,
    });

    // The account root key, as the name implies, is the root of the account.
    // It is important that this key never leaves the device.
    // If a key is compromised, the user account can never be secure.
    const rootKey = window.crypto.getRandomValues(new Uint8Array(32));

    // Using the root key, every account has an identity (signing) keypair produced from it.
    // This keypair is used for authentication such as signing tokens in order to grant
    // authorized access to resources/services provided by Feirm.
    const identityKeypair = await this.deriveIdentityKeypair(rootKey);

    // We need the public key of this keypair to verify signatures
    const identityPublicKey = bufferToHex(identityKeypair.publicKey);

    // Generate 16 bytes of salt to be used for account root key encryption.
    const rootKeySalt = window.crypto.getRandomValues(new Uint8Array(16));

    // The current implementation relies on cryptography methods provided by the aes-js module.
    // To reduce the dependency on third-party libraries, this should eventually be replaced to use
    // the Web Crypto API.
    // This web application currently uses AES256-CBC.

    // Create a new cipher and encrypt the rootkey
    const aesCbc = new ModeOfOperation.cbc(secretKey.hash, rootKeySalt);
    const rootKeyCiphertext = aesCbc.encrypt(rootKey);

    // Construct the encrypted account object to be returned.
    const account = {
      username: username,
      pin: pin,
      rootPasswordSalt: bufferToHex(salt),
      rootPublicKey: identityPublicKey,
      encryptedRootKey: {
        cipherText: bufferToHex(rootKeyCiphertext),
        iv: bufferToHex(rootKeySalt),
      }
    } as EncryptedAccount;

    return account;
  }

  // Derive an identity (signing) keypair from account root
  async deriveIdentityKeypair(
    accountRootKey: Uint8Array
  ): Promise<SignKeyPair> {
    // It isn't sensible to use the same key for multiple use cases, so we
    // should derive a signing "key" which is used as the seed to produce
    // a full ed25519 signing keypair.
    const identityKeyString = bufferToHex(accountRootKey) + Keys.Identity;
    const identityKey = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(identityKeyString)
    );

    // Derive signing keypair from seed
    const identityKeypair = sign.keyPair.fromSeed(new Uint8Array(identityKey));

    return identityKeypair;
  }
}

// Exports
export { Account, Keys };
