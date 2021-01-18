<template>
  <ion-header class="ion-no-border">
    <ion-toolbar class="ion-text-left" color="transparent">
      <ion-title color="dark">Receive</ion-title>
      <ion-buttons slot="secondary">
        <ion-button @click="closeModal" color="dark">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding ion-text-center" v-if="qrCode.length !== 0">
    <ion-grid>
      <ion-row>
        <ion-col>
          <!-- QR Code -->
          <ion-card>
            <ion-card-content>
              <ion-img :src="qrCode"></ion-img>
            </ion-card-content>
          </ion-card>

          <br>

          <!-- Address text functionality -->
          <ion-text @click="copyToClipboard">
            <code>
              <p class="address">
                <b>{{ address }}</b>
              </p>
            </code>
          </ion-text>

          <br>

          <ion-button expand="block" @click="share">
            <ion-icon slot="start" :icon="shareSocial"></ion-icon>
              Share
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-content>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonText,
  IonImg,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  toastController,
  alertController,
  modalController,
  loadingController,
} from "@ionic/vue";
import {
  clipboard,
  shareSocial,
  close,
  helpCircleOutline,
} from "ionicons/icons";
import { FindWallet, DeriveAddress } from "@/lib/wallet";
import QRCode from "qrcode";
import bip21 from "bip21";
import hdWalletP2pkh from "@/class/wallets/hd-wallet-p2pkh";
import axios from "axios";

export default defineComponent({
  name: "ReceivingAddress",
  props: {
    coin: { type: String },
    ticker: { type: String },
  },
  data() {
    return {
      address: "",
      qrCode: "",
    };
  },
  async mounted() {
    // Wrap the entire address + qr derivation into a loading controller
    await loadingController
      .create({
        message: "Loading address...",
      })
      .then((a) => {
        a.present().then(async () => {
          // Derive an address for the coin based on the values we've got in this component.
          // Find the wallet for this coin
          const wallet = hdWalletP2pkh;
          const coin = hdWalletP2pkh.getCoin(this.$props.ticker!);

          // Find next available address index
          // Fetch xpub data
          const xpubData = await axios.get(
            "https://cors-anywhere.feirm.com/" +
            hdWalletP2pkh.getBlockbook(coin.ticker) +
            "/api/v2/xpub/" +
            hdWalletP2pkh.getXpub(coin.ticker) +
            "?tokens=used"
          );

        // Find the lowest index missing index
        let missingIndex = 0;

        if (xpubData.data.tokens) {
          for (let i = 0; i < xpubData.data.tokens.length; i++) {
            // Get the path
            const path: string = xpubData.data.tokens[i].path;

            // Split the path to extract index
            const splitPath = path.split("/");
            const index = splitPath[5];

            // Only continue if the account level is 0 (receiving account)
            if (parseInt(splitPath[4]) === 0) {
              // Increment the index until we reach one that doesnt exist
              if (i + 1 != parseInt(index) + 1) {
                // console.log("Missing path:", i);
                missingIndex = i;
                break;
              }

              missingIndex = i + 1;
            }
          }
        }

          // Derive an address
          const address = wallet.getNodeAddressByIndex(coin.ticker, 0, missingIndex)!; // Receiving account (node), missing index
          this.address = address;

          // BIP21 compliant payment request
          const payment = bip21.encode(address, {}, this.$props.coin)
              
          // Generate a QR code of the address
          await QRCode.toDataURL(payment, { width: 200, margin: 1 }).then((qr) => {
            this.qrCode = qr;
          });

          // Create a WebSocket connection and monitor the address for anything incoming
          const wssUrl = hdWalletP2pkh.getBlockbook(coin.ticker).replace(/(^\w+:|^)\/\//, ''); // Remove HTTP(s)
          const socket = new WebSocket("wss://" + wssUrl + "/websocket");

          // Subscribe to the address channel
          socket.onopen = function() {
            const payload = {
              method: "subscribeAddresses",
              params: {
                addresses: [ address ]
              }
            }

            socket.send(JSON.stringify(payload));
          }

          // Handle messages
          socket.onmessage = function(msg) {
            const data = JSON.parse(msg.data).data;
            if (data) {
              // Iterate over outputs and determine if it is ours
              data.tx.vout.forEach(output => {
                if (output.addresses.includes(address)) {
                  // Show a screen
                  console.log("Incoming TXID:", data.tx.txid);

                  return;
                }
              });
            }
          }

          // Dismiss modal
          a.dismiss();
        })
        .catch(async e => {
          // Dismiss modal
          a.dismiss();

          const error = await alertController.create({
            header: "Error!",
            message: e,
            buttons: ["Close"]
          });

          return error.present();
        })
      });
  },
  methods: {
    share() {
      navigator.share({
        title: `${this.$props.coin as string} Address`,
        text: this.address
      });
    },
    async copyToClipboard() {
      await navigator.clipboard
        .writeText(this.address)
        .then(async () => {
          const toast = await toastController.create({
            message: "Address was copied to your clipboard! ✅",
            duration: 2000,
            cssClass: "copied"
          });

          toast.present();
        })
        .catch(async (err) => {
          // Error alert
          const errorAlert = await alertController.create({
            header: "Clipboard Error!",
            message: err,
            buttons: ["Okay!"],
          });
          errorAlert.present();
        });
    },
    async closeModal() {
      await modalController.dismiss();
    },
  },
  setup() {
    return {
      clipboard,
      shareSocial,
      close,
      helpCircleOutline,
    };
  },
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonText,
    IonImg,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  },
});
</script>

<style scoped>
.address {
  font-size: 12px;
}

ion-grid {
  height: 100%;
}

ion-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>