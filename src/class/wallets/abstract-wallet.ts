/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { entropyToMnemonic } from "bip39";

export abstract class AbstractWallet {
    secret: string; // Going to be a private key or mnemonic

    // Generate a wallet ID based on secret (SHA256)
    async getId() {
        const encodedText = new TextEncoder().encode(this.getSecret());
        const id = await window.crypto.subtle.digest("SHA256", encodedText);
        return id;
    }

    // Generate a wallet secret (bip39 mnemonic)
    generateSecret() {
        const buf = window.crypto.getRandomValues(new Uint8Array(32));
        this.secret = entropyToMnemonic(bufferToHex(buf));
    }

    // Return wallet secret
    getSecret() {
        return this.secret;
    }
}