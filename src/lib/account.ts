import * as argon2 from "argon2-browser";
import bufferToHex from "@/lib/bufferToHex";
import hexStringToBytes from "@/lib/hexStringToBytes";
import * as nacl from "tweetnacl";
import aes from "aes-js";
import tatsuyaApi from "@/apiService/tatsuyaService";
import { store } from '@/store';
import router from '@/router';

interface Account {
  username: string;
  email: string;
  pin: number;
  rootPasswordSalt: string;
  rootPublicKey: string;
  encryptedRootKey: {
    cipherText: string;
    iv: string;
  };
  token: {
    id: string;
    signature: string;
  };
}

async function generateAccount(
  username: string,
  email: string,
  password: string,
  pin: number
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
  const identityKey = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(identityKeyString)
  );

  // Generate a signing ed25519 keypair from a seed (identityKey)
  const rootKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(identityKey));

  // Fetch a temporary registration token and sign it
  let tokenId = "";
  let signature: any = "";
  await tatsuyaApi.getRegistrationToken().then((res) => {
    // Set ID
    tokenId = res.data.id;

    // Create signature
    const encoded = new TextEncoder().encode(res.data.nonce);
    signature = nacl.sign.detached(encoded, rootKeyPair.secretKey);
  });

  // Create Salt for RootKey encryption
  const rootKeySalt = window.crypto.getRandomValues(new Uint8Array(16));

  // Encrypt rootKey with AES-256-CBC using the secretKey and rootKeySalt
  const aesCBC = new aes.ModeOfOperation.cbc(secretKey.hash, rootKeySalt);
  const cipherText = aesCBC.encrypt(rootKey);

  const account = {
    username: username,
    email: email,
    pin: pin,
    rootPasswordSalt: bufferToHex(saltArray),
    rootPublicKey: bufferToHex(rootKeyPair.publicKey),
    encryptedRootKey: {
      cipherText: bufferToHex(cipherText),
      iv: bufferToHex(rootKeySalt),
    },
    token: {
      id: tokenId,
      signature: bufferToHex(signature),
    },
  } as Account;

  return account;
}

// Handle an account login request (fetch, decrypt, sign and submit)
async function loginAccount(
  username: string,
  password: string,
  pin: number
): Promise<null> {
  // Fetch the encrypted account blob
  await tatsuyaApi.fetchEncryptedAccount(username, pin).then(async (res) => {
    // Derive the secret key using Argon2 along with password + salt
    const secretKey = await argon2.hash({
      pass: password,
      salt: hexStringToBytes(res.data.rootPasswordSalt),
      type: argon2.ArgonType.Argon2id,
      hashLen: 32,
    });

    // Attempt to decrypt the account with AES
    const rootKeySalt = aes.utils.hex
      .toBytes(res.data.encryptedRootKey.iv)
      .slice(0, 16);
    const aesCBC = new aes.ModeOfOperation.cbc(secretKey.hash, rootKeySalt);

    let rootKey = "";

    try {
      rootKey = bufferToHex(
        aesCBC.decrypt(
          aes.utils.hex.toBytes(res.data.encryptedRootKey.cipherText)
        )
      );
    } catch (e) {
      throw new Error(e);
    }

    // Reconstruct the identity key from the root key
    const identityKeyString = rootKey + "identity";
    const identityKey = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(identityKeyString)
    );

    // Derive the signing ed25519 keypair from identityKey
    const rootKeyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(identityKey));

    // Fetch a login token and sign it
    await tatsuyaApi.getLoginToken(username).then(async (res) => {
      const id = res.data.id;
      const nonce = res.data.nonce;

      // Create signature
      const signature = nacl.sign.detached(new TextEncoder().encode(nonce), rootKeyPair.secretKey);

      // Send the token and signature back to the API
      const token = {
        id: id,
        username: username,
        signature: bufferToHex(signature)
      }
      await tatsuyaApi.loginAccount(token).then(res => {
        store.dispatch("login", res.data);
        router.push({ path: "/" })
      });
    });
  });

  return null;
}

export { Account, generateAccount, loginAccount };
