<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, modalController } from "@ionic/vue";
import { defineComponent, onBeforeMount } from "vue";

import PasswordPrompt from "@/components/Auth/Password.vue";
import Account from "@/class/account";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  async beforeCreate() {
    // When the app is mounting, prompt for password entry to decrypt
    // Check if account root key is already in cache
    if (Account.getRootKey() !== undefined) {
      return;
    }

    // Check if an encrypted account is present
    const username = localStorage.getItem("username")!;
    const account = await Account.fetchAccountFromIDB(username);
    if (!account) {
      // Do not want to continue if they don't have an account
      return;
    }

    // We have the encrypted account, so we can request for a password
    const passwordPrompt = await modalController.create({
      component: PasswordPrompt,
    });

    passwordPrompt.present();
  },
});
</script>