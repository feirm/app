import { loadingController, modalController } from "@ionic/vue";
import { useStore } from "vuex";
import tatsuyaService from "./apiService/tatsuyaService";
import PINVue from "./components/Auth/PIN.vue";
import { DecryptContacts, EncryptedContact } from "./lib/contacts";
import { decryptWallet } from "./lib/encryptWallet";
import { Wallet } from "./lib/wallet";

export async function preload() {
  // An array of funny messages
  const funnyMessages: string[] = [
    "Spinning the hamster wheel... 🐹",
    "Generating witty dialog... 🤖",
    "Spinning the Bitcoin wheel of fortune... 💸",
    "Twiddling our thumbs... 👍",
    "Definitely not a virus... 🦠",
    "Fetching more code monkeys... 🐒",
  ];

  // Existing instance of Vuex store
  const store = useStore();

  // We want to pre-load everything from addresses, transactions etc,
  // and continue to check for new transactions every couple of seconds
  // Pick a funny loading message at random
  const loadingMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];

  // Check the Vuex state to see if a user is logged in
  const loggedIn = store.getters.isUserLoggedIn;

  if (!loggedIn) {
      return;
  }

  // Testing statement
  console.log("Preloading...");

  // Check the Vuex state for a wallet and any encryption properties
  const wallet = store.getters.getWallet;
  const isWalletFormatEncrypted = store.getters.isWalletEncrypted;

  // Maximum unlock attempts we can have is 3
  const maxUnlockAttempts = 3;

  // If the wallet isn't unlocked, try and unlock it
  if (!store.getters.isWalletUnlocked) {
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
      message: loadingMessage,
    })
    .then((a) => {
      // Show loading popup
      a.present().then(async () => {
        // TODO Fetch transaction data
        // TODO Fetch wallet balance data

        // Fetch and decrypt contacts
        await tatsuyaService.fetchContacts().then(async (res) => {
          // Set the encrypted contacts array
          const contacts = res.data as EncryptedContact[];

          // Attempt to decrypt contacts array
          await DecryptContacts(contacts)
            .then((decryptedContacts) => {
              store.commit("setContacts", decryptedContacts);
            })
            .catch((e) => {
              console.log(e);
            });
        });
      });

      // Once complete, dismiss the loading controller
      a.dismiss();
    });
}
