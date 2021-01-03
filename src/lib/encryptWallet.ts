import { store } from "@/store";
import { ModeOfOperation, padding, utils } from "aes-js";
import { ArgonType, hash } from "argon2-browser"
import bufferToHex from "./bufferToHex";

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
}

export {
    encryptWallet
}