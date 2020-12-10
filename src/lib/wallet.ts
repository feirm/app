import { entropyToMnemonic, mnemonicToSeed } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import * as coininfo from "coininfo";
import { payments, bip32 } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";

// Feirm network
const feirm = coininfo.feirm.main;
const feirmNetwork = feirm.toBitcoinJS();

// Wallet interface
interface Wallet {
  id: string;
  mnemonic: string;
  coins: [
    {
      name: string;
      rootKey: string;
      extendedPrivateKey: string;
      extendedPublicKey: string;
      index: number;
      blockbook: string;

      // Network information
      network: {
        bip44: number;
        txVersion: number;
        messagePrefix: string;
        bech32: string;
        bip32: {
          private: number;
          public: number;
        };
        pubKeyHash: number;
        scriptHash: number;
        wif: number;
      };
    }
  ];
}

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
  const entropy = window.crypto.getRandomValues(new Uint8Array(32));
  const mnemonic = entropyToMnemonic(bufferToHex(entropy));
  return mnemonic;
}

// Take a mnemonic and derive a wallet for a coin
async function DeriveWallet(mnemonic: string, ticker: string): Promise<Wallet> {
  // Derive seed from mnemonic
  const seed = await mnemonicToSeed(mnemonic);

  // Fetch the coin data for the provided ticker and assemble network information from it
  const coinData = await azureService.getCoin(ticker);

  // BIP-44
  const rootKey = fromSeed(seed, feirmNetwork);

  const derivationPath = "m/44'/0'/0'";
  const addressNode = rootKey.derivePath(derivationPath);

  // Assemble the wallet
  const wallet = {
    id: uuidv4(),
    mnemonic: mnemonic,
    coins: [] as {}
  } as Wallet;

  // Generate coin data
  const coin = {
    name: coinData.data.coinInformation.name,
    rootKey: rootKey.toBase58(),
    extendedPrivateKey: addressNode.toBase58(),
    extendedPublicKey: addressNode.neutered().toBase58(),
    index: 0,
    blockbook: coinData.data.coinInformation.blockbook,

    // Network information
    network: {
      bip44: coinData.data.coinInformation.bip44,
      txVersion: coinData.data.coinInformation.txVersion,
      messagePrefix: coinData.data.coinInformation.networks.p2pkh.messagePrefix,
      bech32: coinData.data.coinInformation.networks.p2pkh.bech32,
      bip32: {
        private: coinData.data.coinInformation.networks.p2pkh.bip32.private,
        public: coinData.data.coinInformation.networks.p2pkh.bip32.private,
      },
      pubKeyHash: coinData.data.coinInformation.networks.p2pkh.pubKeyHash,
      scriptHash: coinData.data.coinInformation.networks.p2pkh.scriptHash,
      wif: coinData.data.coinInformation.networks.p2pkh.wif,
    },
  };

  wallet.coins.push(coin);

  // Save the wallet in Vuex
  store.commit("setWalletState", wallet);

  return wallet;
}

// Derive a new address from xpub and index
function DeriveAddress(xpub: string, index: number): string {
  const { address } = payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(0)
      .derive(index).publicKey,
    network: feirmNetwork,
  });

  return address!;
}

export { GenerateMnemonic, DeriveWallet, DeriveAddress, Wallet };
