import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import { fromSeed } from "bip32";
import bufferToHex from './bufferToHex';
import { payments } from 'bitcoinjs-lib';
import * as coininfo from "coininfo";

// Feirm network
const feirm = coininfo.feirm.main
const feirmNetwork = feirm.toBitcoinJS()

// Wallet interface
interface Wallet {
    Mnemonic: string;
    RootKey: string;
    ExtendedPrivateKey: string;
    ExtendedPublicKey: string;
    Index: number;
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

    // BIP-44
    const rootKey = fromSeed(seed, feirmNetwork);

    // m / 44' / 193' / 0' / 0 / address
    const addressNode = rootKey.derivePath("m/44'/193'/0'/0");

    console.log("master root key:", rootKey.toBase58())
    console.log("extended private key:", addressNode.toBase58())
    console.log("extended public key:", addressNode.neutered().toBase58())

    for (let i = 0; i < 20; i++) {
        const addressNode = rootKey.derive(i);

        const address = payments.p2pkh({
            pubkey: addressNode.publicKey,
            network: feirmNetwork
        });

        console.log(address.address);
    }
}

export {
    GenerateMnemonic,
    DeriveWallet
}