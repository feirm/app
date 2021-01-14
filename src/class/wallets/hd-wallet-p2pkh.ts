import { Coin } from "@/models/coin";
import { payments } from "bitcoinjs-lib";
import { AbstractWallet } from "./abstract-wallet";
import { mnemonicToSeedSync } from "bip39";
import { fromBase58, fromSeed } from "bip32";

/**
 * HD Wallet (BIP44)
 * Derived using BIP39 mnemonic
 * Using BIP44 with P2PKH addresses
 * Going to be used for majority of coins except BTC
 */
class HDWalletP2PKH extends AbstractWallet {
    // Add a new coin
    public addCoin(ticker: string): Coin {
        // New instance of the coin object
        const coin = {} as Coin;

        // Fetch coin network data based on ticker
        const coinData = this.getCoinData(ticker);
        const networks = this.getNetwork(ticker);

        // Convert mnemonic secret into seed
        const seed = mnemonicToSeedSync(this.getSecret());

        // Derive the HD wallet data
        let index;
        if (coinData.bip44) {
            index = coinData.bip44;
        } else {
            index = coinData.hdIndex;
        }

        const path = "m/44'/" + index + "'/0'";
        const rootKey = fromSeed(seed, networks.p2pkh);
        coin.rootKey = rootKey.toBase58();

        const node = rootKey.derivePath(path);
        coin.extendedPublicKey = node.neutered().toBase58();
        coin.extendedPrivateKey = node.toBase58();

        // Set the remainder of the properties
        coin.name = coinData.name;
        coin.ticker = coinData.ticker;
        coin.balance = "0";
        coin.unconfirmedBalance = "0";

        // Add to the existing coins
        this.coins.push(coin);

        return coin;
    }

    // Set confirmed balance
    public setBalance(ticker: string, amount: string) {
        // Update coins array
        for (let i = 0; i < this.coins.length; i++) {
            if (ticker.toLocaleLowerCase() === this.coins[i].ticker.toLocaleLowerCase()) {
                // Update the balance
                this.coins[i].balance = amount;
            }
        }
    }

    // Set unconfirmed balance
    public setUnconfirmedBalance(ticker: string, amount: string) {
        // Update coins array
        for (let i = 0; i < this.coins.length; i++) {
            if (ticker.toLocaleLowerCase() === this.coins[i].ticker.toLocaleLowerCase()) {
                // Update the balance
                this.coins[i].unconfirmedBalance = amount;
            }
        }
    }

    // Get xpub for coin
    public getXpub(ticker: string) {
        // Fetch the coin data
        const coinData = this.getCoinData(ticker);
        const networks = this.getNetwork(ticker);

        // Derive it otherwise
        const mnemonic = this.secret;
        const seed = mnemonicToSeedSync(mnemonic);
        const root = fromSeed(seed, networks.p2pkh);

        // Correct indexes
        let index;
        if (coinData.bip44) {
            index = coinData.bip44;
        } else {
            index = coinData.hdIndex;
        }

        const path = "m/44'/" + index + "'/0'";
        const child = root.derivePath(path).neutered();

        return child.toBase58();
    }

    // Fetch an address by its node and index
    public getNodeAddressByIndex(ticker: string, node: number, index: number) {
        // Fetch coin network
        const networks = this.getNetwork(ticker);
        
        const xpub = this.getXpub(ticker);
        const { address } = payments.p2pkh({
            pubkey: fromBase58(xpub).derive(node).derive(index).publicKey,
            network: networks.p2pkh
        })
        
        return address;
    }

    // Get UTXOs for a coin

    // Get transactions for a coin
}

export default new HDWalletP2PKH();