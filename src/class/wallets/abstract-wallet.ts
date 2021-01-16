/*
This is an abstract class for what a wallet should look like at the very least.
Each wallet should be able to derive multiple coins using the same BIP39 private key.
*/

import bufferToHex from "@/lib/bufferToHex";
import { Coin } from "@/models/coin";
import { Transaction, Utxo } from "@/models/transaction";
import { Wallet } from "@/models/wallet";
import { store } from "@/store";
import { entropyToMnemonic, validateMnemonic } from "bip39";
import axios from "axios";
import BigNumber from "bignumber.js";

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

    // Get transactions for ALL coins
    async getAllTransactions() {
        this.transactions = [];

        const coins = this.getAllCoins();

        for (let i = 0; i < coins.length; i++) {
            // Individual coin and Blockbook
            const coin = coins[i];
            const blockbookUrl = this.getBlockbook(coin.ticker);
            
            await axios.get(
                `https://cors-anywhere.feirm.com/${blockbookUrl}/api/v2/xpub/${coin.extendedPublicKey}?details=txs&tokens=used`
            ).then(res => {
                // Iterate through all transactions, and match them up with our tokens
                const txs = res.data.transactions;
                const tokens = res.data.tokens;

                // If transactions are empty, return
                if (!txs) {
                    return;
                }
                
                txs.forEach(tx => {
                    // Set basic transaction properties
                    const walletTx = {} as Transaction;
                    walletTx.ticker = coin.ticker.toLocaleLowerCase();
                    walletTx.txid = tx.txid;
                    walletTx.blockTime = tx.blockTime;
                    walletTx.confirmations = tx.confirmations;

                    // Iterate through the transaction outputs and determine if the TX belongs to us
                    tx.vout.forEach(vout => {
                        // Exclude change addresses from this process
                        tokens.forEach(token => {
                            // Split the token so we can get the account (0 or 1);
                            const splitToken = token.path.split("/");
                            const index = parseInt(splitToken[4]);

                            // Get the address (name) from token
                            const address = token.name;

                            // Not a change address, so continue
                            if (index === 0) {
                                // If the output includes our address, it means it is targeted to us - making it incoming
                                if (vout.addresses.includes(address)) {
                                    const value = new BigNumber(vout.value).dividedBy(100000000).toString();
                                    walletTx.value = value;
                                    walletTx.isMine = true;
                                }
                            }

                            // It is a change address, so the transaction might be outgoing
                            // so find the output, and deduct it from the original amount + fees
                            if (index === 1) {
                                if (vout.addresses.includes(address)) {
                                    const txValue = new BigNumber(tx.value).dividedBy(100000000);
                                    const changeOutput = new BigNumber(vout.value).dividedBy(100000000);
                                    const amount = txValue.minus(changeOutput);
                                    
                                    walletTx.value = amount.toString();
                                }
                            }
                        });
                    })

                    // Lastly, push the transaction to our TXs array
                    this.transactions.push(walletTx);
                })
            });
        }

        // Update the state
        store.commit("setAllTransactions", this.transactions);
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