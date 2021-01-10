<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, loadingController, modalController } from '@ionic/vue';
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';
import PINVue from './components/Auth/PIN.vue';
import { decryptWallet } from './lib/encryptWallet';
import { Wallet } from './lib/wallet';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  setup() {
    // An array of funny messages
    const funnyMessages: string[] = [
      "Spinning the hamster wheel... 🐹",
      "Generating witty dialog... 🤖",
      "Spinning the Bitcoin wheel of fortune... 💸",
      "Twiddling our thumbs... 👍",
      "Definitely not a virus... 🦠",
      "Fetching more code monkeys... 🐒"
    ]

    // Existing instance of Vuex store
    const store = useStore();

    // When the Vue instance is first mounting, we want
    // to pre-load everything from addresses, transactions etc,
    // and continue to check for new transactions every couple of seconds
    onMounted(async () => {
      // Pick a funny loading message at random
      const loadingMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)]

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
                description: `You have ${
                  maxUnlockAttempts - i
                } unlock attempts remaining.`,
              }
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

      // Show a loading controller
      const load = await loadingController.create({
        message: loadingMessage,
        duration: 2000
      })

      load.present();
    })
  }
});
</script>