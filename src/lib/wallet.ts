import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import { fromSeed } from "bip32";
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

// Take a mnemonic and derive an BTC BIP-44 wallet
async function DeriveWallet(mnemonic: string): Promise<any> {
    // Derive seed from mnemonic
    const seed = await mnemonicToSeed(mnemonic);

    // Feirm Network
    const feirmNetwork = {
        messagePrefix: "\x18DarkNet Signed Message:\n",
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0xc,
        scriptHash: 0x39,
        wif: 0x37
    }

    // BIP-44
    const rootKey = fromSeed(seed, feirmNetwork);
    const addressNode = rootKey.derivePath("m/44'/193'/0'/0");

    console.log("xprivkey:", addressNode.toBase58())
    console.log("xpubkey:", addressNode.neutered().toBase58())
}

export {
    GenerateMnemonic,
    DeriveWallet
}