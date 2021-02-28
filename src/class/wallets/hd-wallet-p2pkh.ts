import { payments, Psbt } from "bitcoinjs-lib";
import { AbstractWallet } from "./abstract-wallet";
import { mnemonicToSeedSync } from "bip39";
import { fromBase58, fromSeed } from "bip32";
import { Utxo } from "@/models/transaction";
import BigNumber from "bignumber.js";
import b58 from "bs58check";
import axios from "axios";

/**
 * HD Wallet (BIP44)
 * Derived using BIP39 mnemonic
 * Using BIP44 with P2PKH addresses
 * Going to be used for majority of coins except BTC
 */
class HDWalletP2PKH extends AbstractWallet {
    // Get xpub for coin
    getXpub(ticker: string) {
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
        const xpub = child.toBase58();

        // BitcoinJS does not support any other version than XPUB, so convert ourselves
        let data = b58.decode(xpub)
        data = data.slice(4);
        data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);

        return b58.encode(data);
    }

    // Fetch an address by its node and index
    getNodeAddressByIndex(ticker: string, node: number, index: number) {
        // Fetch coin network
        const networks = this.getNetwork(ticker);
        
        const xpub = this.getXpub(ticker);

        const { address } = payments.p2pkh({
            pubkey: fromBase58(xpub).derive(node).derive(index).publicKey,
            network: networks.p2pkh
        })
        
        return address;
    }

    // Fetch a P2PKH change address that is unused
    async getChangeAddress(ticker: string): Promise<string> {
        // Fetch coin xpub and relevant network data
        const xpub = this.getXpub(ticker);
        const network = this.getNetwork(ticker).p2pkh;

        // Blockbook instance of coin
        const blockbookUrl = this.getBlockbook(ticker);

        // Fetch XPUB data
        const xpubData = await axios.get(
            "https://cors-anywhere.feirm.com/" +
            blockbookUrl +
            "/api/v2/xpub/" +
            xpub +
            "?tokens=used"
        );

        // Iterate over the XPUB data to find the lowest change index
        let lowestChangeIndex = 0;

        if (xpubData.data.tokens) {
            for (let i = 0; i < xpubData.data.tokens.length; i++) {
                const token = xpubData.data.tokens[i];

                // Get the token BIP path
                const path = token.path;

                // Split up the path to extract the index
                const split = path.split("/");
                const node = parseInt(split[4]);
                const index = parseInt(split[5]);

                // Check that the node is internal (change)
                if (node === 1) {
                    // Now sure how I figured out this works, so don't touch!!!
                    lowestChangeIndex = index + 1;
                }
            }
        }

        // Derive the P2PKH change address
        const address = payments.p2pkh({
            pubkey: fromBase58(xpub).derive(1).derive(lowestChangeIndex).publicKey,
            network: network
        }).address

        return address!;
    }

    // Create a signed transaction
    async createSignedTransaction(ticker: string, address: string, amount: string, fee: string, utxos: Utxo[]): Promise<Psbt> {
        /*
         * Expect the amount and fee to be in Satoshi format.
        */
        const newAmount = new BigNumber(amount);
        const newFee = new BigNumber(fee);
        let valueOfInputs = new BigNumber(0); // Keep a tally of the value of inputs

        // Get coin data, and network data
        const coin = this.getCoin(ticker);
        const coinData = this.getCoinData(ticker);
        const network = this.getNetwork(ticker).p2pkh; // P2PKH network format

        // Create a new partially spent Bitcoin transaction
        const psbt = new Psbt({ network })
        psbt.setVersion(coinData.txVersion);

        // Derive BIP32 root key
        const rootKey = fromBase58(coin.rootKey, network);

        // Organise the UTXOs
        utxos.sort((a, b) => new BigNumber(a.value).toNumber() - new BigNumber(b.value).toNumber());

        // We have the UTXOs, so iterate over them and add them as inputs to our Psbt
        utxos.forEach(utxo => {
            // Only continue to add more inputs if the outgoing value we want is not met
            if (valueOfInputs.isLessThan(newAmount)) {
                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    nonWitnessUtxo: Buffer.from(utxo.hex, "hex"),
                    bip32Derivation: [
                        {
                            masterFingerprint: rootKey.fingerprint,
                            path: utxo.path,
                            pubkey: rootKey.derivePath(utxo.path).publicKey
                        }
                    ]
                })

                console.log("Using input:", utxo.txid, "worth:", utxo.value, "for:", ticker);

                // Increment UTXO input values
                valueOfInputs = valueOfInputs.plus(utxo.value);
            }
        })

        // Construct an output
        psbt.addOutput({
            address: address,
            value: newAmount.toNumber()
        })

        // Construct change output
        const changeAmount = valueOfInputs.minus(newAmount).minus(newFee);
        const changeAddress = await this.getChangeAddress(coin.ticker);
        psbt.addOutput({
            address: changeAddress as string,
            value: changeAmount.toNumber()
        })

        // Sign, validate and finalise all inputs
        psbt.signAllInputsHD(rootKey);
        psbt.validateSignaturesOfAllInputs();
        psbt.finalizeAllInputs();

        return psbt;
    }
}

export default new HDWalletP2PKH();