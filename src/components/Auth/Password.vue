<template>
  <ion-content :fullscreen="true" class="ion-padding">
    <ion-grid>
      <ion-row>
        <ion-col class="ion-text-center">
          <img
            width="64"
            style="margin: 0 auto"
            src="@/assets/img/logos/feirm.png"
            alt="Feirm Logo"
          />
          <h1>
            Welcome back, <b>{{ username }}</b
            >.
          </h1>
          <p>Please enter your Feirm password to decrypt your account. 🔐</p>
          <ion-item lines="none" color="transparent">
            <ion-label position="floating" color="primary">Password</ion-label>
            <ion-input type="password" v-model="password"></ion-input>
          </ion-item>
          <p style="color: tomato;">{{ errorMessage }}</p>
          <ion-button @click="decrypt">
            <p v-if="!decrypting">Decrypt</p>
            <ion-spinner v-if="decrypting"></ion-spinner>
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSpinner,
  modalController
} from "@ionic/vue";
import Account from "@/class/account";
import { sign } from "tweetnacl";
import hexStringToBytes from "@/lib/hexStringToBytes";
import bufferToHex from "@/lib/bufferToHex";

export default defineComponent({
  name: "Password",
  components: {
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSpinner,
  },
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
      decrypting: false,
    };
  },
  async mounted() {
    // Get username
    const username = localStorage.getItem("username")!;
    this.username = username;

    // Check if an encryption key is already present in LocalStorage
    // and then auto decrypt
    const encryptionKey = localStorage.getItem("encryptionKey");
    if (encryptionKey) {
      // Toggle decrypting state
      this.decrypting = true;

      // Convert the stretched key hex string to byte array
      const key = hexStringToBytes(encryptionKey);

      // We have the stretched key, so we need to use it to auto decrypt the root key
      const encryptedAccount = await Account.fetchAccountFromIDB(username);
      const rootKey = await Account.decryptAccount(key, encryptedAccount);

      // Derive the identity keypair and check if the public keys match
      // (maybe replace this with signatures in the future...)
      const keypair = await Account.deriveIdentityKeypair(rootKey);
      if (bufferToHex(keypair.publicKey) === encryptedAccount.rootPublicKey) {
        // They are a match!
        // So set the root key and close the component
        Account.setRootKey(rootKey);
        modalController.dismiss();
      } else {
        // TODO: Handle this
        console.log("Something went wrong...");
      }
    }
  },
  methods: {
    async decrypt() {
      // Toggle decrypting state to true
      this.decrypting = true;

      // Fetch account from DB
      const encryptedAccount = await Account.fetchAccountFromIDB(this.username);

      // Derive the stretched secret key
      const secretKey = await Account.derivePassword(this.password, encryptedAccount.rootPasswordSalt);

      // Attempt to decrypt using password
      const rootKey = await Account.decryptAccount(
        secretKey,
        encryptedAccount
      );

      // Create a signature to prove we own the account
      const keypair = await Account.deriveIdentityKeypair(rootKey);
      const signature = sign.detached(new Uint8Array(), keypair.secretKey);

      // Verify the blank signature
      const valid = sign.detached.verify(new Uint8Array(), signature, hexStringToBytes(encryptedAccount.rootPublicKey));

      if (valid) {
        Account.setRootKey(rootKey);
        modalController.dismiss();
      } else {
        // If the signature is invalid, throw a password error
        this.decrypting = false;
        this.errorMessage = "Password is incorrect! Please try again."
      }

      // Toggle decrypting state
      this.decrypting = false;
    },
  },
});
</script>

<style scoped>
/* Center and vertical align grid items */
ion-grid {
  height: 100%;
}

ion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* Minimum width and height for button */
ion-button {
  min-width: 10rem;
  min-height: 3rem;
}
</style>