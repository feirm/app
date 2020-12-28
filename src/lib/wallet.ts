import { entropyToMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import { payments, bip32, Psbt, Network } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";
import axios from "axios";

// Wallet interface
interface Wallet {
  id: string;
  mnemonic: string;
  coins: Coin[];
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
  changeIndex: number;
  blockbook: string;
}

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
    index: coin.data.coinInformation.blockbook,
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
    "https://cors-anywhere.feirm.com/" +
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
  const network = cData.data.coinInformation.networks.p2pkh as Network;
  network.pubKeyHash = network.pubKeyHash[0];
  network.scriptHash = network.scriptHash[0];
  network.wif = network.wif[0];

  // Lets find our wallet
  const wallet = await FindWallet(ticker);

  // Derive the master BIP32 keypair from rootkey
  const masterKey = bip32.fromBase58(wallet.rootKey, network);

  // Create and configure the transaction builder
  const psbt = new Psbt({ network: network });
  psbt.setVersion(cData.data.coinInformation.txVersion);

  // Keep track of the amount we want to send, and the value of inputs
  const AMOUNT_IN_SATOSHIS = amount * 100000000;
  let VALUE_OF_INPUTS = 0;

  // First of all, fetch the utxos for xpub
  await axios
    .get(
      "https://cors-anywhere.feirm.com/" +
        cData.data.coinInformation.blockbook +
        "/api/v2/utxo/" +
        wallet.extendedPublicKey
    )
    .then(async (utxos) => {
      // Lookup the full transactions
      for (let i = 0; i < utxos.data.length; i++) {
        // BIP44 Paths used to derive addresses
        const path = utxos.data[i].path;

        // Add to value of total inputs
        VALUE_OF_INPUTS += parseInt(utxos.data[i].value);

        await axios
          .get(
            "https://cors-anywhere.feirm.com/" +
              cData.data.coinInformation.blockbook +
              "/api/v2/tx-specific/" +
              utxos.data[i].txid
          )
          .then((output) => {
            // Primarily interested in the outputs
            const outputs = output.data.vout;

            for (let j = 0; j < outputs.length; j++) {
              // Check if the derived address matches the one on TX output
              const { address } = payments.p2pkh({
                pubkey: masterKey.derivePath(path).publicKey,
                network: network,
              });

              if (
                outputs[j].scriptPubKey.addresses[0] === address &&
                outputs[j].scriptPubKey.reqSigs === 1
              ) {
                try {
                  // Add the input
                  psbt.addInput({
                    hash: utxos.data[i].txid,
                    index: outputs[j].n,
                    nonWitnessUtxo: Buffer.from(output.data.hex, "hex"),
                  });
                } catch (e) {
                  console.log(e);
                }
              }
            }
          });

        // Update input to include BIP32 derivation data
        try {
          const updateData = {
            bip32Derivation: [
              {
                masterFingerprint: masterKey.fingerprint,
                path: path,
                pubkey: masterKey.derivePath(path).publicKey,
              },
            ],
          };

          psbt.updateInput(i, updateData);
        } catch (e) {
          console.log("Error updating transaction", e);
        }
      }

      // Create an output for the initial amount
      psbt.addOutput({
        address: recipient,
        value: AMOUNT_IN_SATOSHIS,
      });

      // If value of inputs is more than the value of satoshis
      // we can deduct the remainder, send the rest to a change address
      // and apply a flat fee of 0.01 XFE to a transaction
      // TODO

      // Detect and derive a new change address
      // According to blockbook, we always know that the latest change address is going to be last.
      // Implement a couple of checks using the xpub data to make sure it follows the change derivation path, and derive a new change address accordingly
      const xpubData = await axios.get(
        "https://cors-anywhere.feirm.com/" +
          cData.data.coinInformation.blockbook +
          "/api/v2/xpub/" +
          wallet.extendedPublicKey + "?tokens=used"
      );

      // The last used "token" as Blockbook refers to it
      const lastToken = xpubData.data.tokens[xpubData.data.tokens.length - 1];

      // Get the latest index for the change address
      const index = bip32.fromBase58(wallet.rootKey).derivePath(lastToken.path).index

      // Derive change address
      const changeAddress = payments.p2pkh({
        pubkey: bip32
          .fromBase58(wallet.extendedPublicKey)
          .derive(1)
          .derive(index).publicKey,
        network: network,
      }).address;

      // Create an output for the change amount
      psbt.addOutput({
        address: changeAddress!,
        value: VALUE_OF_INPUTS - AMOUNT_IN_SATOSHIS - 1000000,
      });

      // Sign input using BIP32 Master key
      try {
        psbt.signAllInputsHD(masterKey);
      } catch (e) {
        console.log("Error signing all inputs:", e);
      }

      // Validate signature of input
      try {
        psbt.validateSignaturesOfAllInputs();
      } catch (e) {
        console.log("Error validating all signatures:", e);
      }

      // Finalise input
      try {
        psbt.finalizeAllInputs();
      } catch (e) {
        console.log("Error finalising all inputs:", e);
      }

      // Broadcast hex transaction
      const tx = psbt.extractTransaction(true);

      await axios.get(
        "https://cors-anywhere.feirm.com/" +
          cData.data.coinInformation.blockbook +
          "/api/v2/sendtx/" +
          tx.toHex()
      );
    });
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
