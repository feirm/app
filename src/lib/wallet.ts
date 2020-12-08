import { entropyToMnemonic } from "bip39";
import bufferToHex from './bufferToHex';

// Wallet interface
interface Wallet {
    Seed: string;
}

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
    const entropy = window.crypto.getRandomValues(new Uint8Array(32));
    const mnemonic = entropyToMnemonic(bufferToHex(entropy));
    return mnemonic;
}

export {
    GenerateMnemonic
}