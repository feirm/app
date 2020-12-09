import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from './bufferToHex';
import * as coininfo from "coininfo";

// Feirm network
const feirm = coininfo.feirm.main
const feirmNetwork = feirm.toBitcoinJS()

// Wallet interface
interface Wallet {
    id: string;
    mnemonic: string;
    coin: {
        name: string;
        rootKey: string;
        extendedPrivateKey: string;
        extendedPublicKey: string;
        index: number;
    };
}

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
    const entropy = window.crypto.getRandomValues(new Uint8Array(32));
    const mnemonic = entropyToMnemonic(bufferToHex(entropy));
    return mnemonic;
}

// Take a mnemonic and derive an XFE BIP-44 wallet
async function DeriveWallet(mnemonic: string): Promise<Wallet> {
    // Derive seed from mnemonic
    const seed = await mnemonicToSeed(mnemonic);

    // BIP-44
    const rootKey = fromSeed(seed, feirmNetwork);

    const derivationPath = "m/44'/0'/0'"
    const addressNode = rootKey.derivePath(derivationPath);

    // Assemble the wallet
    const wallet = {
        id: uuidv4(),
        mnemonic: mnemonic,
        coin: {
            name: "Feirm",
            rootKey: rootKey.toBase58(),
            extendedPrivateKey: addressNode.toBase58(),
            extendedPublicKey: addressNode.neutered().toBase58(),
            index: 0
        }
    } as Wallet;

    localStorage.setItem("wallet", JSON.stringify(wallet));
    
    return wallet;
}

export {
    GenerateMnemonic,
    DeriveWallet,
    Wallet
}