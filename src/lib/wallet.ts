import { entropyToMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import { payments, bip32 } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";
import blockBookService from '@/apiService/blockBookService';

// Wallet interface
interface Wallet {
  id: string;
  mnemonic: string;
  coins: [
    {
      name: string;
      ticker: string;
      icon: string;
      rootKey: string;
      extendedPrivateKey: string;
      extendedPublicKey: string;
      balance: number;
      index: number;
      blockbook: string;
    }
  ];
}

// Coin interface
interface Coin {
  name: string;
  ticker: string;
  icon: string;
  rootKey: string;
  extendedPrivateKey: string;
  extendedPublicKey: string;
  balance: number;
  index: number;
  blockbook: string;
}

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
  const entropy = window.crypto.getRandomValues(new Uint8Array(32));
  const mnemonic = entropyToMnemonic(bufferToHex(entropy));
  return mnemonic;
}

// Take a mnemonic and derive a wallet for a coin
async function DeriveWallet(mnemonic: string, ticker: string): Promise<Wallet> {
  // First of all, lets validate the mnemonic
  const valid = validateMnemonic(mnemonic);
  if (!valid) {
    throw new Error("The mnemonic provided is not valid!");
  }

  // Derive seed from mnemonic
  const seed = await mnemonicToSeed(mnemonic);

  // Fetch the coin data for the provided ticker and assemble network information from it
  const coinData = await azureService.getCoin(ticker);

  // Set the network
  const network = coinData.data.coinInformation.networks.p2pkh;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash  = network.scriptHash[0];
  network.wif = network.wif[0];

  // BIP-44
  const rootKey = fromSeed(seed, network);

  const derivationPath = "m/44'/0'/0'";
  const addressNode = rootKey.derivePath(derivationPath);

  // Fetch xpub data, specifically the last index
  const xpubData = await blockBookService.getXpub(addressNode.neutered().toBase58())

  // Assemble the wallet
  const wallet = {
    id: uuidv4(),
    mnemonic: mnemonic,
    coins: [] as {},
  } as Wallet;

  // Generate coin data
  const coin = {
    name: coinData.data.coinInformation.name,
    ticker: coinData.data.coinInformation.ticker.toLowerCase(),
    icon: encodeURI(coinData.data.coinInformation.icon),
    rootKey: rootKey.toBase58(),
    extendedPrivateKey: addressNode.toBase58(),
    extendedPublicKey: addressNode.neutered().toBase58(),
    balance: 0,
    index: xpubData.data.usedTokens,
    blockbook: coinData.data.coinInformation.blockbook,
  };

  wallet.coins.push(coin);

  // Save the wallet in Vuex
  store.commit("setWalletState", wallet);

  return wallet;
}

// Derive a new address from xpub and index
async function DeriveAddress(xpub: string, ticker: string): Promise<string> {
  // Fetch the coin data for the provided ticker and assemble network information from it
  const coinData = await azureService.getCoin(ticker);
  const xpubData = await blockBookService.getXpub(xpub);

  // Set the network
  const network = coinData.data.coinInformation.networks.p2pkh;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash  = network.scriptHash[0];
  network.wif = network.wif[0];

  const { address } = payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(0)
      .derive(xpubData.data.usedTokens).publicKey,
    network: network,
  });

  return address as string;
}

// Find an existing coin wallet based on ticker from user input
async function FindWallet(ticker: string): Promise<Coin> {
  const wallet = store.getters.getWallet as Wallet;
  let coin = {} as Coin;

  // Iterate over each of the items until we get a match
  wallet.coins.forEach((c) => {
    if (ticker.toLowerCase() === c.ticker) {
      coin = c;
    }
  });

  return coin;
}

export { GenerateMnemonic, DeriveWallet, DeriveAddress, FindWallet, Wallet, Coin};
