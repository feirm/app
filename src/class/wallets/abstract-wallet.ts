/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { entropyToMnemonic, mnemonicToSeedSync } from "bip39";
import { bip32, Network } from "bitcoinjs-lib";

/*
This model is how a coin within a wallet should look.
*/
// export interface Coin {}

export class AbstractWallet {
    static type = "abstract";
    static typeReadable = "Abstract";

    type: string;
    secret: string; // Going to be a private key or mnemonic

    constructor(type: string, secret: string) {
        this.type = type;
        this.secret = secret;
    }

    // Generate a wallet ID based on secret
    async getId() {
        const encodedText = new TextEncoder().encode(this.getSecret());
        const id = await window.crypto.subtle.digest("SHA256", encodedText);
        return id;
    }

    // Generate a wallet secret (bip39 mnemonic)
    generateSecret() {
        const buf = window.crypto.getRandomValues(new Uint8Array(16));
        this.secret = entropyToMnemonic(bufferToHex(buf));
    }

    // Return wallet secret
    getSecret() {
        return this.secret;
    }

    // Return the extended public key
    getXpub() {
        const mnemonic = this.secret;
        const seed = mnemonicToSeedSync(mnemonic);
        const root = bip32.fromSeed(seed); // TODO add specific network
    }
}