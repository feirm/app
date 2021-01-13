import { Coin } from "@/models/coin";
import bitcoin from "bitcoinjs-lib";
import { AbstractWallet } from "./abstract-wallet";
import { store } from "@/store";
import { mnemonicToSeedSync } from "bip39";
import { fromSeed } from "bip32";
import { Wallet } from "@/models/wallet";

/**
 * HD Wallet (BIP44)
 * Derived using BIP39 mnemonic
 * Using BIP44 with P2PKH addresses
 * Going to be used for majority of coins except BTC
 */
class HDWalletP2PKH extends AbstractWallet {
    public coins: Coin[] = [];

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
        const path = "m/44'/" + coinData.hdIndex + "'/0'";
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

    // Return a wallet by ticker
    public getCoin(ticker: string): Coin {
        ticker = ticker.toLocaleLowerCase();

        for (let i = 0; i < this.getAllCoins().length; i++) {
            if (this.getAllCoins()[i].ticker.toLocaleLowerCase() === ticker.toLocaleLowerCase()) {
                return this.coins[i];
            }
        }

        return {} as Coin;
    }

    // Get blockbook instance by ticker
    public getBlockbook(ticker: string) {
        ticker = ticker.toLocaleLowerCase();

        // Coin data (by ticker)
        const data = this.getCoinData(ticker);

        return data.blockbook;
    }

    // Return all coins
    public getAllCoins() {
        return this.coins;
    }

    // Return all coin data
    public getCoinData(ticker: string) {
        return store.getters.getCoin(ticker);
    }

    // Return all coin networks
    public getNetwork(ticker: string) {
        const networks = store.getters.getCoin(ticker).networks;

        // Format the networks
        // P2PKH
        networks.p2pkh.pubKeyHash = networks.p2pkh.pubKeyHash[0];
        networks.p2pkh.scriptHash = networks.p2pkh.scriptHash[0];
        networks.p2pkh.wif = networks.p2pkh.wif[0];

        return networks;
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

        const path = "m/44'/" + coinData.hdIndex || coinData.bip44 + "'/0'";
        // TODO: Fix potential client issue with API changes ^^^
        const child = root.derivePath(path).neutered();

        return child.toBase58();
    }

    // Fetch an address by its node and index
    public getNodeAddressByIndex(ticker: string, node: number, index: number) {
        // Fetch coin network
        const networks = this.getNetwork(ticker);
        
        const xpub = this.getXpub(ticker);
        const { address } = bitcoin.payments.p2pkh({
            pubkey: bitcoin.bip32.fromBase58(xpub).derive(node).derive(index).publicKey,
            network: networks.p2pkh
        })
        
        return address;
    }

    /*
      * Persistance = need to save mnemonic and wallet ID
    */
    // Save to disk (localStorage)
    async saveToDisk() {
        // Construct an object which resembles a wallet
        const wallet = {
            id: await this.getId(),
            secret: this.getSecret(),
            coins: this.getAllCoins()
        } as Wallet;

        localStorage.setItem("wallet", JSON.stringify(wallet));
    }

    // TODO Save to cache (vuex)
    async saveToCache() {
        // Construct an object which resembles a wallet
        const wallet = {
            id: await this.getId(),
            secret: this.getSecret(),
            coins: this.getAllCoins()
        } as Wallet;

        store.commit("setWalletState", wallet)
        // TODO: Refactor ^^^^
    }

    // TODO Load wallet from disk
    async loadFromDisk(): Promise<Wallet> {
        const wallet = JSON.parse(localStorage.getItem("wallet")!) as Wallet;
        
        // Set the appropriate fields
        this.setSecret(wallet.secret);
        
        const id = await this.getId();
        this.setId(id);

        console.log("loaded coins:", wallet.coins);

        this.coins = wallet.coins;

        return wallet;
    }
}

export default new HDWalletP2PKH();