import {
  alertController,
  loadingController,
  modalController,
} from "@ionic/vue";
import { useStore } from "vuex";
import tatsuyaService from "./apiService/tatsuyaService";
import PINVue from "./components/Auth/PIN.vue";
import { DecryptContacts, EncryptedContact } from "./lib/contacts";
import { decryptWallet } from "./lib/encryptWallet";
import { Wallet } from "./lib/wallet";
import axios from "axios";
import LoadingMessages from "./class/loadingMessages";

export async function preload() {
  // Random loading message
  const wittyLoader = new LoadingMessages();

  // Existing instance of Vuex store
  const store = useStore();

  // We want to pre-load everything from addresses, transactions etc,
  // and continue to check for new transactions every couple of seconds.

  // Check the Vuex state for a wallet and any encryption properties
  const wallet = store.getters.getWallet;
  const walletPresent = store.getters.isWalletPresent;
  const isWalletFormatEncrypted = store.getters.isWalletEncrypted;

  // Maximum unlock attempts we can have is 3
  const maxUnlockAttempts = 3;

  // If the wallet isn't unlocked, try and unlock it
  if (!store.getters.isWalletUnlocked && walletPresent) {
    // Check that a mnemonic is present and that the wallet if encrypted
    if (wallet.mnemonic && isWalletFormatEncrypted) {
      // Enter a loop asking for PIN entry
      for (let i = 0; i < maxUnlockAttempts; i++) {
        // Create a modal for PIN entry
        const pinEntry = await modalController.create({
          component: PINVue,
          componentProps: {
            header: "Unlock your Wallet",
            description: `You have ${maxUnlockAttempts -
              i} unlock attempts remaining.`,
          },
        });

        // Show the prompt
        pinEntry.present();

        // Fetch the PIN modal response
        const pinResponse = await pinEntry.onDidDismiss();
        const pin = pinResponse.data;

        // Now that we've got a PIN, we can attempt to decrypt the wallet
        try {
          // Fetch the encrypted wallet from localStorage
          const wallet = JSON.parse(localStorage.getItem("wallet")!) as Wallet;

          // Decrypt the wallet with our PIN
          const decryptedWallet = await decryptWallet(pin, wallet);

          // Save decrypted wallet in Vuex
          store.commit("setWalletState", decryptedWallet);

          // Update the wallet unlock status
          store.commit("setWalletUnlock", true);

          // Set wallet PIN state
          store.commit("setWalletPin", pin);

          // Break the loop
          break;
        } catch (e) {
          // If we've reached our maximum attempts, clear everything
          if (maxUnlockAttempts - i === 1) {
            store.commit("clearSessionState");
            store.commit("deleteWalletState");
            break;
          }
        }
      }
    }
  }

  await loadingController
    .create({
      message: wittyLoader.getRandom(),
    })
    .then((a) => {
      // Show loading popup
      a.present()
        .then(async () => {
          // Fetch coin data from Azure microservice
          await store.dispatch("setCoins");

          // TODO Fetch transaction data

          // Fetch wallet balance data for each coin we have.
          const walletCoins = store.getters.getCoins;

          if (walletCoins) {
            for (let i = 0; i < walletCoins.length; i++) {
              const coin = walletCoins[i];

              console.log("Fetching balance for:", coin.name);

              try {
                await axios
                  .get(
                    `https://cors-anywhere.feirm.com/${coin.blockbook}/api/v2/xpub/${coin.extendedPublicKey}`
                  )
                  .then((res) => {
                    coin.balance = res.data.balance ? res.data.balance : 0;

                    // Update state
                    store.commit("setWalletBalance", {
                      ticker: coin.ticker,
                      balance: coin.balance,
                    });
                  });
              } catch (e) {
                console.log("Error fetching coin balances...");
              }

              // TODO Attempt to establish a WebSocket connection to the coins Blockbook explorer
              // const wss = new WebSocket(coin.blockbook + "/websocket");
            }
          }

          // Fetch and decrypt contacts
          try {
            await tatsuyaService.fetchContacts().then(async (res) => {
              // Set the encrypted contacts array
              const contacts = res.data as EncryptedContact[];
              if (!contacts) {
                return;
              }

              // Attempt to decrypt contacts array
              await DecryptContacts(contacts)
                .then((decryptedContacts) => {
                  store.commit("setContacts", decryptedContacts);
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          } catch (e) {
            console.log("Error decrypting contacts...");
          }

          // Dismiss the modal
          a.dismiss();
        })
        .catch(async (e) => {
          // Dismiss current loading controller
          a.dismiss();

          // Show error alert
          const alert = await alertController.create({
            header: "Error fetching data!",
            message: e,
            buttons: ["Okay!"],
          });

          return alert.present();
        });
    });
}
