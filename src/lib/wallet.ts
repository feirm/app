import { entropyToMnemonic, mnemonicToSeed, validateMnemonic } from "bip39";
import { fromSeed } from "bip32";
import { v4 as uuidv4 } from "uuid";
import bufferToHex from "./bufferToHex";
import { payments, bip32, Psbt, Network } from "bitcoinjs-lib";
import azureService from "@/apiService/azureService";
import { store } from "@/store";
import axios from "axios";
import { BigNumber } from "bignumber.js";
import { encryptCoin } from "./encryptWallet";

// Wallet interface
interface Wallet {
  id: string;
  mnemonic: string;
  coins: Coin[];
  encryption: Encryption;
}

// Encryption data interface
interface Encryption {
  isEncrypted: boolean;
  encryptionKeySalt: string;
  encryptionIv: string;
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
  isEncrypted: boolean;
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
    index: 0,
  } as Coin;

  // Generate a new wallet
  const wallet = {
    id: uuidv4(),
    mnemonic: mnemonic,
    coins: [] as {},
    encryption: {} as Encryption
  } as Wallet;

  // Push the coin data to our new wallet
  wallet.coins.push(cData);

  // New wallets aren't encrypted by default
  wallet.encryption.isEncrypted = false;

  // Return the newly created wallet
  return wallet;
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
  amount: number,
  fee: number
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
  const AMOUNT_IN_SATOSHIS = new BigNumber(amount).multipliedBy(100000000);
  let VALUE_OF_INPUTS = new BigNumber(0);

  // Convert the fee into satoshi values
  const FEE_IN_SATOSHIS = new BigNumber(fee).multipliedBy(100000000);

  // Fetch all the unspent outputs using the extended public key
  await axios
    .get(
      "https://cors-anywhere.feirm.com/" +
        cData.data.coinInformation.blockbook +
        "/api/v2/utxo/" +
        wallet.extendedPublicKey
    )
    .then(async (utxos) => {
      // Iterate over all the unspent outputs and then look them up fully using the TXID
      for (let i = 0; i < utxos.data.length; i++) {
        // Only continue if the current value of UTXOs is not equal to the amount we want to send in satoshis
        console.log("Using input:", utxos.data[i].txid);

        // We need to set the BIP44 derivation path the transaction used.
        const path = utxos.data[i].path;

        // Add to the total value of our inputs
        VALUE_OF_INPUTS = VALUE_OF_INPUTS.plus(utxos.data[i].value);

        // We want to use this input if its more than the amount of what we want to send
        console.log("Value of inputs so far:", VALUE_OF_INPUTS.toNumber());

        // Now we can lookup the specific UTXO transaction ID and then add it as an input
        await axios
          .get(
            "https://cors-anywhere.feirm.com/" +
              cData.data.coinInformation.blockbook +
              "/api/v2/tx-specific/" +
              utxos.data[i].txid
          )
          .then((output) => {
            // We are only primarily interested in making use of the Vouts
            const vouts = output.data.vout;

            // Iterate over each output and make sure it belongs to us before going any further
            for (let j = 0; j < vouts.length; j++) {
              // Derive the address used in the output - making use of the BIP44 derivation path stored earlier.
              const { address } = payments.p2pkh({
                pubkey: masterKey.derivePath(path).publicKey,
                network: network,
              });

              // Attempt to use the input in our transaction
              if (vouts[j].scriptPubKey.addresses[0] === address) {
                try {
                  psbt.addInput({
                    hash: utxos.data[i].txid,
                    index: vouts[j].n,
                    nonWitnessUtxo: Buffer.from(output.data.hex, "hex"),
                    bip32Derivation: [
                      {
                        masterFingerprint: masterKey.fingerprint,
                        path: path,
                        pubkey: masterKey.derivePath(path).publicKey,
                      },
                    ],
                  });
                } catch (e) {
                  console.log("There was an error using this input:", e);
                  return;
                }
              }
            }
          });
      }
      
      // We can now be sure that the loop has ended and that we are using inputs of the correct value
      // Create an output for the initial amount being spent to the recipient
      console.log("XFE to spend:", AMOUNT_IN_SATOSHIS.toNumber());

      psbt.addOutput({
        address: recipient,
        value: AMOUNT_IN_SATOSHIS.toNumber(),
      });

      // Fetch the extended public key data from Blockbook so we can use the correct change address to send excess funds to.
      const xpubData = await axios.get(
        "https://cors-anywhere.feirm.com/" +
          cData.data.coinInformation.blockbook +
          "/api/v2/xpub/" +
          wallet.extendedPublicKey +
          "?tokens=used"
      );

      // Fetch the last used (change) index
      const lastChange = xpubData.data.tokens[xpubData.data.tokens.length - 1];
      const lastChangeIndex = bip32
        .fromBase58(wallet.rootKey)
        .derivePath(lastChange.path).index;

      // Derive the change address
      const changeAddress = payments.p2pkh({
        pubkey: bip32
          .fromBase58(wallet.extendedPublicKey)
          .derive(1)
          .derive(lastChangeIndex + 1).publicKey,
        network: network,
      }).address;

      try {
        // Lastly create an output taking into consideration
        // the value of inputs, amount we want to send, and then the estimated tx fee
        // this will be sent to our change address
        const changeValue = VALUE_OF_INPUTS.minus(AMOUNT_IN_SATOSHIS).minus(
          FEE_IN_SATOSHIS
        );

        psbt.addOutput({
          address: changeAddress as string,
          value: changeValue.toNumber(),
        });

        console.log("Created change output!");
      } catch (e) {
        console.log("There was an error adding the change output:", e);
        return;
      }
    });

  // Onto the last stretch.
  // Sign all inputs
  psbt.signAllInputsHD(masterKey);

  // Validate signatures of all inputs
  psbt.validateSignaturesOfAllInputs();

  // Finalise all the inputs
  psbt.finalizeAllInputs();

  // Extract the hexadecimal and TXID from constructred tx
  const tx = psbt.extractTransaction(true);
  const txHex = tx.toHex();
  const txHash = tx.getId();

  await axios.get(
    "https://cors-anywhere.feirm.com/" +
      cData.data.coinInformation.blockbook +
      "/api/v2/sendtx/" +
      txHex
  );

  return txHash;
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
