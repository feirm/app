import { fromBase58 } from "bip32";
import { payments } from "bitcoinjs-lib";
import b58 from "bs58check";
import { AbstractWallet } from "./abstract-wallet";

class HDWalletP2WPKH extends AbstractWallet {
    // Derive a Bech32 address
    getNodeAddressByIndex(xpub: string, node: number, index: number): string {
        // Convert ZPUB to XPUB
        let data = b58.decode(xpub)
        data = data.slice(4);
        data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data]);

        xpub = b58.encode(data);

        // Derive Segwit address
        const nodeA = fromBase58(xpub);
        const address = payments.p2wpkh({
            pubkey: nodeA.derive(node).derive(index).publicKey,
        }).address;

        return address!;
    }
}

export default new HDWalletP2WPKH();