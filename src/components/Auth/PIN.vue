<template>
  <ion-content class="ion-padding" fullscreen="true">
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>

    <ion-grid>
      <!-- PIN Entry Heading -->
      <ion-row>
        <ion-col class="ion-text-center">
          <ion-icon :icon="appsOutline" size="large"></ion-icon>
          <ion-text class="ion-text-center">
            <h1>{{ this.$props.header }}</h1>
            <p>{{ this.$props.description }}</p>
          </ion-text>
        </ion-col>
      </ion-row>

      <!-- PIN Entry Digits -->
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-icon
            :icon="pin.length >= 1 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
        <ion-col>
          <ion-icon
            :icon="pin.length >= 2 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
        <ion-col>
          <ion-icon
            :icon="pin.length >= 3 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
        <ion-col>
          <ion-icon
            :icon="pin.length >= 4 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
        <ion-col>
          <ion-icon
            :icon="pin.length >= 5 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
        <ion-col>
          <ion-icon
            :icon="pin.length >= 6 ? ellipse : ellipseOutline"
          ></ion-icon>
        </ion-col>
      </ion-row>

      <!-- Line break -->
      <br />

      <!-- PIN Entry Number Pad -->
      <!-- Numbers 1, 2, 3 -->
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(1)"
            >1</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(2)"
            >2</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(3)"
            >3</ion-button
          >
        </ion-col>
      </ion-row>

      <!-- Numbers 4, 5, 6 -->
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(4)"
            >4</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(5)"
            >5</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(6)"
            >6</ion-button
          >
        </ion-col>
      </ion-row>

      <!-- Numbers 7, 8, 9 -->
      <ion-row class="ion-text-center">
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(7)"
            >7</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(8)"
            >8</ion-button
          >
        </ion-col>
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(9)"
            >9</ion-button
          >
        </ion-col>
      </ion-row>

      <ion-row class="ion-text-center">
        <!-- Delete last digit -->
        <ion-col>
          <ion-fab vertical="bottom" horizontal="center">
            <ion-fab-button @click="deleteLastDigit" :disabled="pin.length === 0" color="danger">
              <ion-icon :icon="backspaceOutline" color="dark"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        </ion-col>

        <!-- Number 0 -->
        <ion-col>
          <ion-button
            size="large"
            fill="outline"
            shape="round"
            @click="handleInput(0)"
            :disabled="clickInProgress"
            >0</ion-button
          >
        </ion-col>

        <!-- Confirm PIN -->
        <ion-col>
          <ion-fab vertical="bottom" horizontal="center">
            <ion-fab-button @click="confirmPin" :disabled="pin.length < 6" color="success">
              <ion-icon :icon="checkmarkOutline" color="dark"></ion-icon>
            </ion-fab-button>
          </ion-fab>
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
  IonIcon,
  IonText,
  IonFab,
  IonFabButton,
  IonButton,
  modalController
} from "@ionic/vue";
import {
  appsOutline,
  ellipse,
  ellipseOutline,
  backspaceOutline,
  checkmarkOutline,
} from "ionicons/icons";

export default defineComponent({
  name: "PIN",
  components: {
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonText,
    IonFab,
    IonFabButton,
    IonButton
  },
  props: {
    header: { type: String },
    description: { type: String },
  },
  data() {
    return {
      pin: "",
      canContinue: false,
    };
  },
  methods: {
    handleInput(n: number) {
      // Convert the number to a string and append it to itself
      this.pin += String(n);

      // If the PIN is equal to six digits, re-enable the continue button
      if (this.pin.length === 6) {
        this.canContinue = true;
      }
    },
    deleteLastDigit() {
        // Remove the last digit from the string of numbers
        this.pin = this.pin.slice(0, -1);
    },
    confirmPin() {
        // Dismiss the modal and return the PIN
        modalController.dismiss(this.pin);
    },
  },
  setup() {
    return {
      appsOutline,
      ellipse,
      ellipseOutline,
      backspaceOutline,
      checkmarkOutline,
    };
  },
});
</script>