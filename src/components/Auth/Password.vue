<template>
  <ion-content :fullscreen="true" class="ion-padding">
    <ion-grid>
      <ion-row>
        <ion-col class="ion-text-center">
          <ion-icon :icon="keyOutline" size="large"></ion-icon>
          <h1>Please enter your Feirm account password</h1>
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input type="password" v-model="password"></ion-input>
          </ion-item>
          <br />
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
  IonIcon,
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
import { keyOutline } from "ionicons/icons";
import Account from "@/class/account";

export default defineComponent({
  name: "Password",
  components: {
    IonContent,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonSpinner
  },
  data() {
    return {
      password: "",
      decrypting: false
    };
  },
  methods: {
    async decrypt() {
        // Toggle decrypting state to true
        this.decrypting = true;

        // Fetch account from DB
        const username = localStorage.getItem("username")!;
        const encryptedAccount = await Account.fetchAccountFromIDB(username);

        // Attempt to decrypt using password
        const rootKey = await Account.decryptAccount(this.password, encryptedAccount);

        // Save account root key
        Account.setRootKey(rootKey);

        // Toggle decrypting state to false
        this.decrypting = false;

        // Close the modal
        await modalController.dismiss();
    },
  },
  setup() {
    return {
      keyOutline,
    };
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
    min-height: 3rem ;
}
</style>