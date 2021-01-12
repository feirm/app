<template>
    <ion-header class="ion-no-border">
      <ion-toolbar class="ion-text-center" color="transparent">
        <ion-buttons slot="secondary">
          <ion-button slot="icon-only" @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding ion-text-left" :fullscreen="true">
      <h3>Verifying your mnemonic backup</h3>
      <ion-text>
        <p>
          To make sure that you have written down your 24-word mnemonic properly, we are going to ask
          you to reassemble the entire mnemonic from scratch.
        </p>
        <p>If you tap on the wrong word, simply tap on it again to remove it from the assembled mnemonic.</p>
      </ion-text>

      <!-- Area where mnemonic is being assembled -->
      <div class="mnemonic-area">
        <ion-chip color="dark" v-for="word in assembledMnemonic" v-bind:key="word" @click="removeWord(word)">
          {{ word }}
        </ion-chip>
      </div>

      <!-- Random pool of mnemonic words -->
      <p v-show="splitMnemonic.length > 0">Available words: {{ splitMnemonic.length }}</p>
      <ion-chip color="dark" v-for="word in splitMnemonic" v-bind:key="word" @click="addWord(word)">
        {{ word }}
      </ion-chip>
    </ion-content>
    <ion-footer class="ion-no-border ion-padding">
      <ion-button expand="block" @click="verify">Validate</ion-button>
    </ion-footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonText,
  IonButton,
  IonFooter,
  IonChip,
  IonIcon,
  modalController
} from "@ionic/vue";
import { closeOutline } from "ionicons/icons";

import { validateMnemonic } from "bip39";

export default defineComponent({
  name: "BackupMnemonic",
  props: {
    mnemonic: { type: String }
  },
  components: {
    IonContent,
    IonHeader,
    IonToolbar,
    IonText,
    IonButton,
    IonFooter,
    IonChip,
    IonIcon
  },
  data() {
    return {
      assembledMnemonic: [] as string[],
      splitMnemonic: [] as string[]
    };
  },
  methods: {
    // Adding a word from shuffled to assembled
    addWord(word: string) {
      // Determine word index in array and remove it
      const index = this.splitMnemonic.indexOf(word);
      this.splitMnemonic.splice(index, 1);

      // Append the word to the assembled array
      this.assembledMnemonic.push(word);
    },

    // Removing a word from assembled and back into shuffled
    removeWord(word: string) {
      // Determine word index and remove it from assembled array
      const index = this.assembledMnemonic.indexOf(word);
      this.assembledMnemonic.splice(index, 1);

      // Append the word to the shuffled array
      this.splitMnemonic.push(word);
    },

    // Verify the assembled mnemonic and move onto the next stage
    verify() {
      const mnemonic = this.$props.mnemonic; // Mnemonic passed to this component, previously generated.
      const assembledMnemonic = this.assembledMnemonic.join(" "); // Assembled mnemonic in its sentence form

      // Check the assembled string is valid according to bip39
      const valid = validateMnemonic(assembledMnemonic);
      if (!valid) {
        // TODO Throw some error about validation
        return;
      }

      // Check the two mnemonics match each other
      if (mnemonic === assembledMnemonic) {
        // TODO Show a success message
        console.log("The mnemonics match...")
      }
    },

    // Close the component
    async closeModal() {
      await modalController.dismiss();
    }
  },
  created() {
    // Split and shuffle the array
    let mnemonicArray = this.$props.mnemonic!.split(" ");
    mnemonicArray = mnemonicArray.sort(() => Math.random() - 0.5);
    this.splitMnemonic = mnemonicArray;
  },
  setup() {
    return {
      closeOutline
    }
  }
});
</script>

<style scoped>
.mnemonic-area {
  background-color: var(--ion-color-light);
  padding: 15px;
  min-height: 4.5em;
}
</style>