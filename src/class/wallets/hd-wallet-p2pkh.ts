import { payments, Psbt } from "bitcoinjs-lib";
import { AbstractWallet } from "./abstract-wallet";
import { mnemonicToSeedSync } from "bip39";
import { fromBase58, fromSeed } from "bip32";
import { Utxo } from "@/models/transaction";
import BigNumber from "bignumber.js";

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

        return child.toBase58();
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

    // Create a signed transaction
    createSignedTransaction(ticker: string, address: string, amount: string, fee: string, utxos: Utxo[]): Psbt {
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

        // We have the UTXOs, so iterate over them and add them as inputs to our Psbt
        utxos.forEach(utxo => {

            // Might not need all of the UTXOs, so stop when needed
            if (valueOfInputs.isGreaterThanOrEqualTo(newAmount)) {
                return;
            }

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

            console.log("Using input:", utxo.txid);

            // Increment input values
            valueOfInputs = valueOfInputs.plus(utxo.value);
        })

        // Construct an output
        psbt.addOutput({
            address: address,
            value: newAmount.toNumber()
        })

        // Construct change output
        const changeAmount = valueOfInputs.minus(newAmount).minus(newFee);
        const changeAddress = this.getNodeAddressByIndex(coin.ticker, 1, 0);
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