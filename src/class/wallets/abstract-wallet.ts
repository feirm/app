/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { Coin } from "@/models/coin";
import { Transaction } from "@/models/transaction";
import { Wallet } from "@/models/wallet";
import { store } from "@/store";
import { entropyToMnemonic, validateMnemonic } from "bip39";
import { DateTime } from "luxon";
import axios from "axios";

export abstract class AbstractWallet {
    id: string; // Wallet ID derived from secret mnemonic
    secret: string; // Going to be a private key or mnemonic
    coins: Coin[] = []; // Coins available in wallet
    transactions: Transaction[] = []; // All transactions throughout a single wallet

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

    // Get blockbook instance by ticker
    getBlockbook(ticker: string) {
        ticker = ticker.toLocaleLowerCase();

        // Coin data (by ticker)
        const data = this.getCoinData(ticker);

        return data.blockbook;
    }

    // Return all coin data
    getCoinData(ticker: string) {
        return store.getters.getCoin(ticker);
    }

    // Return all coin networks
    getNetwork(ticker: string) {
        return store.getters.getCoin(ticker).networks;
    }

    // Get transactions for ALL coins
    async getAllTransactions() {
        const coins = this.getAllCoins();

        for (let i = 0; i < coins.length; i++) {
            // Individual coin and Blockbook
            const coin = coins[i];
            const blockbookUrl = this.getBlockbook(coin.ticker);
            
            await axios.get(
                `https://cors-anywhere.feirm.com/${blockbookUrl}/api/v2/xpub/${coin.extendedPublicKey}?details=txs&tokens=used`
            ).then(res => {
                // Iterate through all the transactions
                const txs = res.data.transactions;

                for (let j = 0; j < txs.length; j++) {
                    // Isolate transaction
                    const isolatedTx = res.data.transactions[j];

                    // Create instance of new transaction we are going to work with
                    const tx = {} as Transaction;

                    // Set the transaction properties
                    tx.txid = isolatedTx.txid;

                    // Format the Date
                    tx.blockTime = DateTime.fromSeconds(parseInt(isolatedTx.blockTime)).toRelative();

                    tx.value = isolatedTx.value // In satoshis
                    tx.ticker = coin.ticker.toLocaleLowerCase();

                    // Push the transaction to the array
                    this.transactions.push(tx);

                    // Sort the array
                    this.transactions.sort((a, b) => new DateTime(b.blockTime) - new DateTime(a.blockTime))
                }
            });

            // Update the state
            store.commit("setAllTransactions", this.transactions);
        }
    }

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

    // Save to cache (vuex)
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

    // Load wallet from disk
    async loadFromDisk(): Promise<Wallet> {
        const wallet = JSON.parse(localStorage.getItem("wallet")!) as Wallet;
        
        // Set the appropriate fields
        this.setSecret(wallet.secret);
        
        const id = await this.getId();
        this.setId(id);

        this.coins = wallet.coins;

        return wallet;
    }
}