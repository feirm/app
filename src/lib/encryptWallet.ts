import { store } from "@/store";
import { ModeOfOperation, padding, utils } from "aes-js";
import { ArgonType, hash } from "argon2-browser";
import bufferToHex from "./bufferToHex";
import hexStringToBytes from "./hexStringToBytes";
import { Coin, Wallet } from "./wallet";

async function decryptWallet(pin: string, wallet: Wallet): Promise<Wallet> {
  // Determine if wallet itself is encrypted
  const isEncrypted = store.getters.isWalletDecrypted;

  if (wallet.encryption.isEncrypted && !isEncrypted) {
    // Derive the encryption key from our PIN
    const secretKey = await hash({
      pass: pin,
      type: ArgonType.Argon2id,
      hashLen: 32,
      salt: hexStringToBytes(wallet.encryption.encryptionKeySalt),
    });

    // Convert the encryption data IV to a valid byte source
    const iv = utils.hex.toBytes(wallet.encryption.encryptionIv);

    // Attempt to decrypt the mnemonic
    try {
      // Create a new AES-CBC decipher for mnemonic decryption
      const aesCbc = new ModeOfOperation.cbc(secretKey.hash, iv);
      const mnemonic = await aesCbc.decrypt(utils.hex.toBytes(wallet.mnemonic));

      wallet.mnemonic = utils.utf8.fromBytes(mnemonic).replace(/[^\x20-\x7E]/g, "");
    } catch (e) {
      throw new Error(
        "Unable to decrypt mnemonic. Please make sure your PIN is correct!"
      );
    }

    // Attempt to decrypt all of the coins which exist in the users wallet
    if (wallet.coins.length !== 0) {
      for (let i = 0; i < wallet.coins.length; i++) {
        const coin = wallet.coins[i];

        // Check that the coin has the encryption property
        if (coin.isEncrypted) {
          try {
            // Attempt to decrypt the root key
            let aesCoinCipher = new ModeOfOperation.cbc(secretKey.hash, iv);
            const rootKey = aesCoinCipher.decrypt(utils.hex.toBytes(coin.rootKey));
            coin.rootKey = utils.utf8.fromBytes(rootKey);

            // Attempt to decrypt extended private key
            aesCoinCipher = new ModeOfOperation.cbc(secretKey.hash, iv);
            const exPrivKey = aesCoinCipher.decrypt(utils.hex.toBytes(coin.extendedPrivateKey));
            coin.extendedPrivateKey = utils.utf8.fromBytes(padding.pkcs7.strip(exPrivKey));

            // Set coin data again
            wallet.coins[i] = coin;
          } catch (e) {
            console.log(e);
            throw new Error(
              "Unable to decrypt wallet! Please make sure your PIN is correct!"
            );
          }
        }
      }
    }
  }

  return wallet;
}

// Encrypt individual coin and return back the object
async function encryptCoin(pin: string, coin: Coin): Promise<Coin> {
  const wallet = store.getters.getWallet;

  // Derive the same Argon2 encryption key from our PIN
  const secretKey = await hash({
    pass: pin,
    type: ArgonType.Argon2id,
    hashLen: 32,
    salt: hexStringToBytes(wallet.encryption.encryptionKeySalt),
  });

  // Generate an IV to encrypt the data
  const encryptionIv = hexStringToBytes(wallet.encryption.encryptionIv);
  const aesCbc = new ModeOfOperation.cbc(secretKey.hash, encryptionIv);

  // Encrypt several elements of the coin
  try {
    console.log("rootkey during encryption:", coin.rootKey);

    const rootKeyCiphertext = aesCbc.encrypt(padding.pkcs7.pad(utils.utf8.toBytes(coin.rootKey)));
    coin.rootKey = utils.hex.fromBytes(rootKeyCiphertext);

    console.log("rootkey after encryption:", coin.rootKey);

    const extendedPrivateKeyCiphertext = aesCbc.encrypt(
      padding.pkcs7.pad(utils.utf8.toBytes(coin.extendedPrivateKey))
    );
    coin.extendedPrivateKey = bufferToHex(extendedPrivateKeyCiphertext);

    // Set coin state to encrypted
    coin.isEncrypted = true;
  } catch (e) {
    console.log("Error encrypting coin:", coin.name, "error:", e);
  }

  // Return the newly encrypted coin data
  return coin;
}

async function encryptWallet(pin: string) {
  // Convert the PIN into a more secure Argon2 key
  const salt = window.crypto.getRandomValues(new Uint8Array(16));

  const secretKey = await hash({
    pass: pin,
    type: ArgonType.Argon2id,
    hashLen: 32,
    salt: salt,
  });

  // Fetch the existing wallet state from our store
  const wallet = store.getters.getWallet;

  // Generate an IV to encrypt the data
  const encryptionIv = window.crypto.getRandomValues(new Uint8Array(16));

  try {
    const aesCbc = new ModeOfOperation.cbc(secretKey.hash, encryptionIv);

    // Encrypt the wallet mnemonic
    const mnemonicCipherText = aesCbc.encrypt(
      utils.utf8.toBytes(wallet.mnemonic)
    );
    wallet.mnemonic = bufferToHex(mnemonicCipherText);

    // Iterate over each of the coins and encrypt their root keys and extended private keys
    for (let i = 0; i < wallet.coins.length; i++) {
      const coin = wallet.coins[i];

      try {
        const rootKeyCiphertext = aesCbc.encrypt(
          padding.pkcs7.pad(utils.utf8.toBytes(coin.rootKey))
        );
        coin.rootKey = bufferToHex(rootKeyCiphertext);

        const extendedPrivateKeyCiphertext = aesCbc.encrypt(
          padding.pkcs7.pad(utils.utf8.toBytes(coin.extendedPrivateKey))
        );
        coin.extendedPrivateKey = bufferToHex(extendedPrivateKeyCiphertext);

        // Set coin state to encrypted
        coin.isEncrypted = true;

        // Set coin data again
        wallet.coins[i] = coin;
      } catch (e) {
        console.log("Error encrypting coin:", coin.name, "error:", e);
        break;
      }
    }

    // Update the wallet with the newly encrypted one
    wallet.encryption.isEncrypted = true;
    wallet.encryption.encryptionKeySalt = bufferToHex(salt);
    wallet.encryption.encryptionIv = bufferToHex(encryptionIv);
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }

  return wallet;
}

export { encryptWallet, decryptWallet, encryptCoin };
