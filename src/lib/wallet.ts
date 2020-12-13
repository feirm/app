import { entropyToMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import { payments, bip32 } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";
import blockBookService from "@/apiService/blockBookService";

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

// Take a mnemonic and derive a wallet for a coin (based on ticker)
async function DeriveWallet(mnemonic: string, ticker: string): Promise<any> {
  // First of all, lets validate the mnemonic
  const valid = validateMnemonic(mnemonic);
  if (!valid) {
    throw new Error("The mnemonic provided is not valid!");
  }

  // Derive seed from mnemonic
  const wallet = await mnemonicToSeed(mnemonic).then(async (seed) => {
    // Fetch the coin data based on the ticker provided
    await azureService.getCoin(ticker).then((coin) => {
      // Form the network information
      const network = coin.data.coinInformation.networks.p2pkh;

      network.pubKeyHash = network.pubKeyHash[0];
      network.scriptHash = network.scriptHash[0];
      network.wif = network.wif[0];

      // Set the derivation path
      const derivationPath = "m/44'/" + coin.data.coinInformation.bip44 + "'/0'";

      // Generate the root key
      const rootKey = fromSeed(seed, network);

      // Derive the address node from root key
      const addressNode = rootKey.derivePath(derivationPath);

      // Now that we've got our address node, we can begin to either create a new wallet, or append to an existing one.
      // But first, lets assemble all the coin data
      const cData = {
        name: coin.data.coinInformation.name,
        ticker: coin.data.coinInformation.ticker.toLowerCase(),
        icon: encodeURI(coin.data.coinInformation.icon),
        rootKey: rootKey.toBase58(),
        extendedPrivateKey: addressNode.toBase58(),
        extendedPublicKey: addressNode.neutered().toBase58(),
        blockbook: coin.data.coinInformation.blockbook,
      } as Coin;

      // If there is a wallet, then append the coin to it
      const existingWallet = localStorage.getItem("wallet");
      if (existingWallet) {
        // We need to parse the wallet so its available to us
        const pWallet = JSON.parse(existingWallet) as Wallet;

        // Push the coin data to it
        pWallet.coins.push(cData);

        // Return the full wallet interface
        return pWallet;
      }

      // If we made it here, we are going to assume a wallet doesn't exist, so lets generate one
      const nWallet = {
        id: uuidv4(),
        mnemonic: mnemonic,
        coins: [] as {}
      } as Wallet;

      // Push the coin data to our new wallet
      nWallet.coins.push(cData);

      // Return the newly created wallet
      return nWallet;
    });
  });

  return wallet;
}

// Derive a new address from xpub and index
async function DeriveAddress(xpub: string, ticker: string): Promise<string> {
  // Fetch the coin data for the provided ticker and assemble network information from it
  if (!ticker) {
    throw new Error("Ticker is not present!");
  }

  const coinData = await azureService.getCoin(ticker);
  const xpubData = await blockBookService.getXpub(xpub);

  // Set the network
  const network = coinData.data.coinInformation.networks.p2pkh;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash = network.scriptHash[0];
  network.wif = network.wif[0];

  const { address } = payments.p2pkh({
    pubkey: bip32
      .fromBase58(xpub)
      .derive(0)
      .derive(xpubData.data.usedTokens ? xpubData.data.usedTokens : 0)
      .publicKey,
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

export {
  GenerateMnemonic,
  DeriveWallet,
  DeriveAddress,
  FindWallet,
  Wallet,
  Coin,
};
