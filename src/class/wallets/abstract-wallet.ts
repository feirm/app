/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { entropyToMnemonic, validateMnemonic } from "bip39";

export abstract class AbstractWallet {
    id: string; // Wallet ID derived from secret mnemonic
    secret: string; // Going to be a private key or mnemonic

    // Generate a wallet ID
    async getId() {
        // Check if ID already exists
        if (this.id) {
            return this.id;
        }

        const buffer = new TextEncoder().encode(this.getSecret());
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
        const hashHex = bufferToHex(hashBuffer);

        return hashHex;
    }

    // Set wallet ID
    setId(id: string) {
        this.id = id;
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

    // Set wallet secret
    setSecret(secret: string) {
        const valid = validateMnemonic(secret);
        if (!valid) {
            throw new Error("The mnemonic is not valid!");
        }

        this.secret = secret;
    }
}