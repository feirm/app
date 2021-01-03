import { store } from "@/store";
import { ModeOfOperation, padding, utils } from "aes-js";
import { ArgonType, hash } from "argon2-browser"
import bufferToHex from "./bufferToHex";
import hexStringToBytes from "./hexStringToBytes";

async function decryptWallet(pin: string) {
    // Fetch the wallet from Vuex state
    const wallet = store.getters.getWallet;

    // Derive the encryption key from our PIN
    const secretKey = await hash({
        pass: pin,
        type: ArgonType.Argon2id,
        hashLen: 32,
        salt: hexStringToBytes(wallet.encryption.encryptionKeySalt)
    })

    // Convert the encryption data IV to a valid byte source
    const iv = utils.hex.toBytes(wallet.encryption.encryptionIv);

    // Create a new AES-CBC decipher
    const aesCbc = new ModeOfOperation.cbc(secretKey.hash, iv);

    // Attempt to decrypt the mnemonic
    try {
        const mnemonic = aesCbc.decrypt(utils.hex.toBytes(wallet.mnemonic));
        wallet.mnemonic = utils.utf8.fromBytes(mnemonic);
    } catch (e) {
        throw new Error("Unable to decrypt mnemonic. Please make sure your PIN is correct!")
    }

    // Attempt to decrypt all of the coins
    for (let i = 0; i < wallet.coins.length; i++) {
        const coin = wallet.coins[i];

        // Check that the coin has the encryption property
        if (coin.isEncrypted) {
            // Attempt to decrypt the root key
            try {
                const rootKey = aesCbc.decrypt(utils.hex.toBytes(coin.rootKey))
                wallet.rootKey = utils.utf8.fromBytes(padding.pkcs7.strip(rootKey));
            } catch (e) {
                throw new Error("Unable to decrypt root key!")
            }

            // Attempt to decrypt extended private key
            try {
                const exPrivKey = aesCbc.decrypt(utils.hex.toBytes(coin.extendedPrivateKey))
                wallet.extendedPrivateKey = utils.utf8.fromBytes(padding.pkcs7.strip(exPrivKey));
            } catch (e) {
                throw new Error("Unable to decrypt extended private key!")
            }
        }
    }

    // Set the wallet unlocked state
    store.commit("setWalletUnlockedState", wallet);
}

async function encryptWallet(pin: string) {
    // Convert the PIN into a more secure Argon2 key
    const salt = window.crypto.getRandomValues(new Uint8Array(16));

    const secretKey = await hash({
        pass: pin,
        type: ArgonType.Argon2id,
        hashLen: 32,
        salt: salt
    })

    // Fetch the existing wallet state from our store
    const wallet = store.getters.getWallet;

    // Generate an IV to encrypt the data
    const encryptionIv = window.crypto.getRandomValues(new Uint8Array(16));

    try {
        const aesCbc = new ModeOfOperation.cbc(secretKey.hash, encryptionIv)

        // Encrypt the wallet mnemonic
        const mnemonicCipherText = aesCbc.encrypt(utils.utf8.toBytes(wallet.mnemonic));
        wallet.mnemonic = bufferToHex(mnemonicCipherText);

        // Iterate over each of the coins and encrypt their root keys and extended private keys
        for (let i = 0; i < wallet.coins.length; i++) {
            const coin = wallet.coins[i];

            try {
                const rootKeyCiphertext = aesCbc.encrypt(padding.pkcs7.pad(utils.utf8.toBytes(coin.rootKey)));
                coin.rootKey = bufferToHex(rootKeyCiphertext);

                const extendedPrivateKeyCiphertext = aesCbc.encrypt(padding.pkcs7.pad(utils.utf8.toBytes(coin.extendedPrivateKey)));
                coin.extendedPrivateKey = bufferToHex(extendedPrivateKeyCiphertext);

                // Set coin state to encrypted
                coin.isEncrypted = true;
            } catch (e) {
                console.log("Error encrypting coin:", coin.name, "error:", e);
                break;
            }
        }
    } catch (e) {
        throw new Error(e);
    }

    // Update the wallet with the newly encrypted one
    wallet.encryption.isEncrypted = true;
    wallet.encryption.encryptionKeySalt = bufferToHex(salt);
    wallet.encryption.encryptionIv = bufferToHex(encryptionIv);

    // Commit to store
    store.commit("setWalletState", wallet);

    // As we have the PIN, we can decrypt the wallet and update our state for this session.
    await decryptWallet(pin);
}

// TODO Encrypt individual coin

export {
    encryptWallet,
    decryptWallet
}