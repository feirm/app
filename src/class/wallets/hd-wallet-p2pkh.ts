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

    // Get xpub for coin
    public getXpub(ticker: string) {
        // Get existing coin wallet
        const coin = this.getCoin(ticker);

        // Make sure we don't already have it
        if (coin.extendedPublicKey) {
            return coin.extendedPublicKey;
        }

        // Fetch the coin data
        const coinData = store.getters.getCoin(ticker)

        // Derive it otherwise
        const mnemonic = this.secret;
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const root = bitcoin.bip32.fromSeed(seed, coinData.networks.p2pkh);

        const path = "m/44'/" + coinData.hdIndex + "'/0'";
        const child = root.derivePath(path).neutered();

        coin.extendedPublicKey = child.toBase58();
        return coin.extendedPublicKey;
    }
}