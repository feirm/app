/* eslint-disable no-console */

import { payments, bip32, Psbt, Network } from "bitcoinjs-lib";
import { store } from "@/store";
import axios from "axios";
import { BigNumber } from "bignumber.js";

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
  // Before starting anything, get specific coin data
  const cData = await store.getters.getCoin(ticker);

  // We can now construct the network information for said coin (p2pkh)
  const network = cData.networks.p2pkh as Network;

  // Lets find our wallet
  const wallet = await FindWallet(ticker);

  // Derive the master BIP32 keypair from rootkey
  const masterKey = bip32.fromBase58(wallet.rootKey, network);

  // Create and configure the transaction builder
  const psbt = new Psbt({ network: network });
  psbt.setVersion(cData.txVersion);

  // Keep track of the amount we want to send, and the value of inputs
  const AMOUNT_IN_SATOSHIS = new BigNumber(amount).multipliedBy(100000000);
  let VALUE_OF_INPUTS = new BigNumber(0);

  // Convert the fee into satoshi values
  const FEE_IN_SATOSHIS = new BigNumber(fee).multipliedBy(100000000);

  // Fetch all the unspent outputs using the extended public key
  await axios
    .get(
      "https://cors-anywhere.feirm.com/" +
        cData.blockbook +
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
              cData.blockbook +
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
          cData.blockbook +
          "/api/v2/xpub/" +
          wallet.extendedPublicKey +
          "?tokens=used"
      );

      // Find the lowest index missing index
      let lowestChangeIndex = 0;

      if (xpubData.data.tokens) {
        for (let i = 0; i < xpubData.data.tokens.length; i++) {
          // Get the path
          const path: string = xpubData.data.tokens[i].path;

          // Split the path to extract index
          const splitPath = path.split("/");
          const account = parseInt(splitPath[4]);
          const index = parseInt(splitPath[5]);

          // Check that its under the change account we can continue
          if (account == 1) {
            // Increment the index until we reach one that doesnt exist
            if (i + 1 != index + 1) {
              lowestChangeIndex = i;
              break;
            }

            lowestChangeIndex = i + 1;
          }
        }
      }

      // Derive the change address
      const changeAddress = payments.p2pkh({
        pubkey: bip32
          .fromBase58(wallet.extendedPublicKey)
          .derive(1)
          .derive(lowestChangeIndex).publicKey,
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
      cData.blockbook +
      "/api/v2/sendtx/" +
      txHex
  );

  return txHash;
}

export {
  FindWallet,
  CreateSignedTransaction,
  Wallet,
  Coin,
};
