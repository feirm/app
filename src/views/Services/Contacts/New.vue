<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="ion-text-center">
        <ion-buttons slot="start">
          <ion-back-button></ion-back-button>
        </ion-buttons>
        <ion-buttons slot="secondary">
          <ion-button @click="encryptContact">
            <ion-text>Done</ion-text>
          </ion-button>
        </ion-buttons>
        <ion-title>New Contact</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true">
      <ion-item-group>
        <ion-item>
          <ion-input
            v-model="firstName"
            placeholder="First Name"
            type="text"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="lastName"
            placeholder="Last Name"
            type="text"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="feirmId"
            placeholder="Feirm ID"
            type="text"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="phoneNumber"
            placeholder="Phone Number"
            type="tel"
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            v-model="email"
            placeholder="Email Address"
            type="email"
          ></ion-input>
        </ion-item>
      </ion-item-group>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonItemGroup,
  IonItem,
  IonInput,
  IonButton,
  alertController,
} from "@ionic/vue";
import { informationCircleOutline } from "ionicons/icons";
import { Contact, CreateEncryptedContact } from "@/lib/contacts";
import { useRouter } from "vue-router";
import tatsuyaService from "@/apiService/tatsuyaService";

export default defineComponent({
  name: "NewContact",
  components: {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonItemGroup,
    IonItem,
    IonInput,
    IonButton,
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      feirmId: "",
      phoneNumber: "",
      email: "",
    };
  },
  methods: {
    async encryptContact() {
      // Assemble standard contact payload
      const contact = {
        FirstName: this.firstName,
        LastName: this.lastName,
        FeirmID: this.feirmId,
        PhoneNumber: this.phoneNumber,
        Email: this.email,
      } as Contact;

      // Validate fields (very basic and awful)
      if (contact.FirstName == "") {
        this.showMessage("First name field cannot be empty.");
        return;
      }
      if (contact.LastName == "") {
        this.showMessage("Last name field cannot be empty.");
        return;
      }
      if (contact.FeirmID == "") {
        this.showMessage("Feirm ID field cannot be empty.");
        return;
      }

      // Encrypt the payload
      const encryptedContact = await CreateEncryptedContact(contact);

      // Submit payload to API
      await tatsuyaService.newContact(encryptedContact);

      // Wipe contact data
      // TODO Optimise
      this.firstName = "";
      this.lastName = "";
      this.feirmId = "";
      this.phoneNumber = "";
      this.email = "";

      // Return to contacts screen
      this.router.push({ path: "/tabs/contacts" });
    },
  },
  setup() {
    const router = useRouter();

    async function showMessage(message: string) {
      const alert = await alertController.create({
        header: "Error!",
        message: message,
        buttons: ["Okay"],
      });

      return alert.present();
    }

    return {
      router,
      informationCircleOutline,
      showMessage,
    };
  },
});
</script>