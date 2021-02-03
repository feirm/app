/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { Coin } from "@/models/coin";
import { Transaction, Utxo } from "@/models/transaction";
import { Wallet } from "@/models/wallet";
import { store } from "@/store";
import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import axios from "axios";
import { fromSeed } from "bip32";

export abstract class AbstractWallet {
    id: string; // Wallet ID derived from secret mnemonic
    secret: string; // Going to be a private key or mnemonic
    coins: Coin[] = []; // Coins available in wallet
    transactions: Transaction[] = []; // All transactions throughout a single wallet
    websockets = [] as any // Maintain a state of Websocket connections

    // Generate a wallet ID
    async getId() {
        // Check if ID already exists
        if (this.id) {
            return this.id;
        }

        const buffer = new TextEncoder().encode(this.getSecret());
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
        const hashHex = bufferToHex(hashBuffer);

        return hashHex;
    }

    // Set wallet ID
    setId(id: string) {
        this.id = id;
    }

    // Generate a wallet secret (bip39 mnemonic)
    generateSecret() {
        const buf = window.crypto.getRandomValues(new Uint8Array(32));
        this.secret = entropyToMnemonic(bufferToHex(buf));
    }

    // Return wallet secret
    getSecret() {
        return this.secret;
    }

    // Set wallet secret
    setSecret(secret: string) {
        const valid = validateMnemonic(secret);
        if (!valid) {
            throw new Error("The mnemonic is not valid!");
        }

        this.secret = secret;
    }
    
    // Set all coins in our wallet
    setCoins(coins: Coin[]) {
        this.coins = coins;
    }

    // Return all coins in our wallet
    getAllCoins() {
        return this.coins;
    }

    // Return a coin wallet by searching for its ticker
    getCoin(ticker: string): Coin {
        ticker = ticker.toLocaleLowerCase();

        for (let i = 0; i < this.getAllCoins().length; i++) {
            if (this.getAllCoins()[i].ticker.toLocaleLowerCase() === ticker.toLocaleLowerCase()) {
                return this.coins[i];
            }
        }

        return {} as Coin;
    }

    // Delete an entire wallet and all of its state
    deleteWallet() {
        this.coins = [];
        this.secret = "";
        this.id = "";
    }

    // Get blockbook instance by ticker
    getBlockbook(ticker: string) {
        ticker = ticker.toLowerCase();

        // Coin data (by ticker)
        const data = this.getCoinData(ticker);

        return data.blockbook;
    }

    // Establish WSS connection to Blockbook and add to connections list
    establishWss(ticker: string): WebSocket {        
        // Get Blockbook instance and remove HTTPS prefix
        const blockbookUrl = this.getBlockbook(ticker).replace(/(^\w+:|^)\/\//, '');

        // Create new Websocket
        const socket = new WebSocket("wss://" + blockbookUrl + "/websocket");

        // Add the connection to the Websocket connections array
        const obj = {
            ticker: ticker.toLowerCase() as string,
            socket: socket as WebSocket
        }

        this.websockets.push(obj);

        return socket;
    }

    // Fetch an existing websocket connection
    getWss(ticker: string): WebSocket {
        ticker = ticker.toLowerCase();
        const socket = this.websockets.find(socket => socket.ticker === ticker).socket;

        return socket;
    }

    // Return all coin data
    getCoinData(ticker: string) {
        return store.getters.getCoin(ticker);
    }

    // Return all coin networks
    getNetwork(ticker: string) {
        return store.getters.getCoin(ticker).networks;
    }

    // Add a new coin
    addCoin(ticker: string) {
        // Fetch coin network data based on ticker
        const coinData = this.getCoinData(ticker);
        const networks = this.getNetwork(ticker);

        // Convert mnemonic secret into seed
        const mnemonic = this.getSecret();
        const seed = mnemonicToSeedSync(mnemonic);

        // Derive the HD wallet data
        const index = coinData.hdIndex;

        // New instance of the coin object
        const coin = {} as Coin;

        // Set the remainder of the properties
        coin.name = coinData.name;
        coin.ticker = coinData.ticker;
        coin.balance = "0";
        coin.unconfirmedBalance = "0";

        // Derive according to network
        // P2PKH (legacy address)
        if (networks.p2pkh) {
            const path = "m/44'/" + index + "'/0'";
            const rootKey = fromSeed(seed, networks.p2pkh);
            coin.rootKey = rootKey.toBase58();

            const node = rootKey.derivePath(path);
            coin.extendedPublicKey = node.neutered().toBase58();
            coin.extendedPrivateKey = node.toBase58();

            this.coins.push(coin);
            return coin;
        }

        // P2WPKH (native segwit)
        if (networks.P2WPKH) {
            const path = "m/84'/" + index + "'/0'"; // BIP84
            const rootKey = fromSeed(seed, networks.P2WPKH);
            coin.rootKey = rootKey.toBase58();

            const node = rootKey.derivePath(path);
            coin.extendedPublicKey = node.neutered().toBase58();
            coin.extendedPrivateKey = node.toBase58();

            this.coins.push(coin);
            return coin;
        }
    }

    // Fetch and set confirmed + unconfirmed balances
    setBalances(ticker: string, xpub: string) {
        // Get WSS connection for coin
        const ws = this.getWss(ticker);

        // Query for balances
        // But first, construct a payload
        const payload = {
            method: "getAccountInfo",
            params: {
                descriptor: xpub
            }
        }

        ws.onopen = () => {
            ws.send(JSON.stringify(payload));
        }

        // Listen for message and get balance data
        const self = this; // Hacky work-around
        ws.onmessage = function(msg) {
            const data = JSON.parse(msg.data).data;

            // Iterate over coins
            // Hardcode for XFE
            for (let i = 0; i < self.coins.length; i++) {
                self.coins[i].balance = data.balance;
                self.coins[i].unconfirmedBalance = data.unconfirmedBalance;
            }

            // Update store
            store.commit("setWalletState", self.getWallet())
        }
    }

    // Return an object of the entire wallet
    getWallet(): Wallet {
        const wallet = {
            id: this.id,
            secret: this.secret,
            coins: this.coins
        } as Wallet;

        return wallet;
    }

    // Fetch the UTXOs for a coin
    async getUtxos(ticker: string) {
        // Get coin data from ticker
        const coin = this.getCoin(ticker);
        const blockbookUrl = this.getBlockbook(ticker);

        // Empty UTXO array
        const utxos: Utxo[] = [];
        
        // Get the confirmed UTXOs
        await axios.get(
            "https://cors-anywhere.feirm.com/" +
            blockbookUrl +
            "/api/v2/utxo/" +
            coin.extendedPublicKey
        ).then(async res => {
            const txs = res.data;

            // Iterate through all the UTXOs until value > maxValue
            for (let i = 0; i < txs.length; i++) {
                const tx = txs[i];

                // New Utxo object
                const utxo = {} as Utxo;

                // We need to fetch the full transaction hex
                await axios.get("https://cors-anywhere.feirm.com/" + blockbookUrl + "/api/v2/tx-specific/" + tx.txid).then(res => {
                    utxo.hex = res.data.hex;
                })

                // Assemble the rest of the transaction data we need
                utxo.txid = tx.txid;
                utxo.value = tx.value;
                utxo.vout = tx.vout;
                utxo.path = tx.path;

                utxos.push(utxo);
            }
        })

        return utxos;
    }

    // Broadcast signed raw TX to network
    async submitTx(ticker: string, hex: string) {
        const blockbookUrl = this.getBlockbook(ticker); 

        await axios.get(
            "https://cors-anywhere.feirm.com/" +
            blockbookUrl +
            "/api/v2/sendtx/" +
            hex
        )
    }

    // Save wallet to Vuex and localStorage
    saveWallet() {
        const wallet = this.getWallet();

        if (!Array(wallet.coins) || !wallet.coins.length) {
            return;
        }

        store.commit("setWalletState", wallet);
        localStorage.setItem("wallet", JSON.stringify(wallet));
    }

    // Load wallet from disk
    async loadFromDisk() {
        const wallet = JSON.parse(localStorage.getItem("wallet")!) as Wallet;

        // Set the appropriate fields
        this.setSecret(wallet.secret);
        this.setId(await this.getId());
        this.setCoins(wallet.coins);

        return wallet;
    }
}