import { entropyToMnemonic } from "bip39";
import bufferToHex from './bufferToHex';

// Wallet interface
interface Wallet {
    Seed: string;
}

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
    // Generate some entropy
    const entropy = window.crypto.getRandomValues(new Uint8Array(32));

    // Derive mnemonic from entropy
    const mnemonic = entropyToMnemonic(bufferToHex(entropy));

    console.log(mnemonic);

    return mnemonic;
}

export {
    GenerateMnemonic
}