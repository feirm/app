import { Coin } from "@/models/coin";
import bitcoin from "bitcoinjs-lib";
import bip39 from "bip39";
import { AbstractWallet } from "./abstract-wallet";
import { store } from "@/store";

/**
 * HD Wallet (BIP44)
 * Derived using BIP39 mnemonic
 * Using BIP44 with P2PKH addresses
 * Going to be used for majority of coins except BTC
 */
export class HDWalletP2PKH extends AbstractWallet {
    public coins: { ticker: string, coin: Coin }[] = [];

    // Return a wallet by ticker
    public getCoin(ticker: string): Coin {
        ticker = ticker.toLocaleLowerCase();
        return this.coins[ticker];
    }

    // Return all coin data
    public getCoinData(ticker: string) {
        return store.getters.getCoin(ticker);
    }

    // Return all coin networks
    public getNetwork(ticker: string) {
        return store.getters.getCoin(ticker).networks;
    }

    // Get xpub for coin
    public getXpub(ticker: string) {
        // Get existing coin wallet
        const coin = this.getCoin(ticker);

        // Make sure we don't already have it
        if (coin.extendedPublicKey) {
            return coin.extendedPublicKey;
        }

        // Fetch the coin data
        const coinData = this.getCoinData(ticker);
        const networks = this.getNetwork(ticker);

        // Derive it otherwise
        const mnemonic = this.secret;
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bitcoin.bip32.fromSeed(seed, networks.p2pkh);

        const path = "m/44'/" + coinData.hdIndex + "'/0'";
        const child = root.derivePath(path).neutered();

        coin.extendedPublicKey = child.toBase58();
        return coin.extendedPublicKey;
    }

    // Fetch an address by its node and index
    public getNodeAddressByIndex(ticker: string, node: number, index: number) {
        // Fetch coin network
        const networks = this.getNetwork(ticker);

        // Receiving or internal account
        if (node === 0) {
            const xpub = this.getXpub(ticker);

            const { address } = bitcoin.payments.p2pkh({
                pubkey: bitcoin.bip32.fromBase58(xpub).derive(node).derive(index).publicKey,
                network: networks.p2pkh
            })

            return address;
        }

        // External or change account
        if (node === 1) {
            const xpub = this.getXpub(ticker);

            const { address } = bitcoin.payments.p2pkh({
                pubkey: bitcoin.bip32.fromBase58(xpub).derive(node).derive(index).publicKey,
                network: networks.p2pkh
            })

            return address;
        }
    }
}