import { fromBase58, fromSeed } from "bip32";
import { mnemonicToSeedSync } from "bip39";
import { payments } from "bitcoinjs-lib";
import { AbstractWallet } from "./abstract-wallet";

export class HDWalletP2WPKH extends AbstractWallet {
    // Get zpub (native segwit) for coin
    getXpub(ticker: string) {
        // Fetch the coin data
        const coinData = this.getCoinData(ticker);
        const networks = this.getNetwork(ticker);

        // Derive it otherwise
        const mnemonic = this.secret;
        const seed = mnemonicToSeedSync(mnemonic);
        const root = fromSeed(seed, networks.P2WPKH);

        // Correct indexes
        let index;
        if (coinData.bip44) {
            index = coinData.bip44;
        } else {
            index = coinData.hdIndex;
        }

        const path = "m/84'/" + index + "'/0'";
        const child = root.derivePath(path).neutered();

        return child.toBase58();
    }

    // Fetch an address by its node and index
    getNodeAddressByIndex(ticker: string, node: number, index: number) {
        // Fetch coin network
        const networks = this.getNetwork(ticker);
        
        const xpub = this.getXpub(ticker);

        const { address } = payments.p2wpkh({
            pubkey: fromBase58(xpub).derive(node).derive(index).publicKey,
            network: networks.P2WPKH
        })
        
        return address;
    }
}

export default new HDWalletP2WPKH();