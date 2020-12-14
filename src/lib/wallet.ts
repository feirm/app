import { entropyToMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import { payments, bip32, Psbt, ECPair } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";
import axios from "axios";

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

// CORS Anywhere
const corsAnywhereUrl = "https://cors-anywhere.herokuapp.com/";

// Derive a new mnemonic
async function GenerateMnemonic(): Promise<string> {
  const entropy = window.crypto.getRandomValues(new Uint8Array(32));
  const mnemonic = entropyToMnemonic(bufferToHex(entropy));
  return mnemonic;
}

// Take a mnemonic and derive a wallet for a coin (based on ticker)
async function DeriveWallet(mnemonic: string, ticker: string): Promise<Wallet> {
  // First of all, lets validate the mnemonic
  const valid = validateMnemonic(mnemonic);
  if (!valid) {
    throw new Error("The mnemonic provided is not valid!");
  }

  // Derive seed from mnemonic
  const seed = await mnemonicToSeed(mnemonic);

  // Fetch the coin data based on the ticker provided
  const coin = await azureService.getCoin(ticker);

  // Form the network information from coin data
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
    coins: [] as {},
  } as Wallet;

  // Push the coin data to our new wallet
  nWallet.coins.push(cData);

  // Return the newly created wallet
  return nWallet;
}

// Derive a new coin address from the Extended public key
async function DeriveAddress(xpub: string, ticker: string): Promise<string> {
  if (!ticker) {
    throw new Error("Ticker is not present!");
  }

  // Fetch the coin data for the provided ticker and assemble network information from it
  const coinData = await azureService.getCoin(ticker);

  // Set the network
  const network = coinData.data.coinInformation.networks.p2pkh;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash = network.scriptHash[0];
  network.wif = network.wif[0];

  // Fetch xpub data
  const xpubData = await axios.get(
    corsAnywhereUrl +
      coinData.data.coinInformation.blockbook +
      "/api/v2/xpub/" +
      xpub
  );

  // Derive an address using xpub data response
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

// Construct a signed transaction for a coin.
// We need the coin ticker to find the wallet in question, and to also fetch the network data.
// We need the recipient address and amount to be sent.
async function CreateSignedTransaction(
  ticker: string,
  recipient: string,
  amount: number
): Promise<any> {
  // Before starting anything, fetch the coin data from Azure API
  const cData = await azureService.getCoin(ticker);

  // We can now construct the network information for said coin (p2pkh)
  const network = cData.data.coinInformation.networks.p2pkh;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash = network.scriptHash[0];
  network.wif = network.wif[0];

  // Create and configure the transaction builder
  const psbt = new Psbt({ network });
  psbt.setVersion(cData.data.coinInformation.txVersion);

  // Lets find our wallet
  const wallet = await FindWallet(ticker);

  // Derive the master BIP32 keypair
  const masterKeypair = bip32.fromBase58(wallet.rootKey, network);

   // Primary output
  psbt.addOutput({
    address: recipient,
    value: amount * 100000000,
  });

  // Fetch and form our inputs
  try {
    await axios
      .get(
        cData.data.coinInformation.blockbook +
          "/api/v2/utxo/" +
          wallet.extendedPublicKey
      )
      .then(async (res) => {
        // Iterate through the transactions
        for (let i = 0; i < res.data.length; i++) {
          // We need to fetch the transaction specific details, so fetch the individual transaction
          await axios
            .get(
              cData.data.coinInformation.blockbook +
                "/api/v1/tx/" +
                res.data[i].txid
            )
            .then(async (tx) => {
              // We have our TX data, so we can add it to the transaction builder
              try {
                psbt.addInput({
                  hash: tx.data.txid,
                  index: res.data[i].vout,
                  nonWitnessUtxo: Buffer.from(tx.data.hex, "hex"),
                });

                console.log("Added TXID:", tx.data.txid, "to inputs...");
              } catch (e) {
                console.log("1")
                throw new Error(e);
              }

              // Now try signing the input
              try {
                const wif = masterKeypair.derivePath(res.data[i].path).toWIF();
                psbt.signInput(i, ECPair.fromWIF(wif, network));
                console.log("Signed TXID:", res.data[i].txid);
              } catch (e) {
                console.log("2")
                throw new Error(e);
              }
            });
        }
      });
  } catch (e) {
    console.log("Error with TX:", e);
  }

  // TODO Change address

  // Finalise the transaction inputs
  psbt.finalizeAllInputs();

  // Convert to hex
  console.log(psbt.extractTransaction(true).toHex());
}

export {
  GenerateMnemonic,
  DeriveWallet,
  DeriveAddress,
  FindWallet,
  CreateSignedTransaction,
  Wallet,
  Coin,
};
