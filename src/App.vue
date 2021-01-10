<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, loadingController } from '@ionic/vue';
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'vuex';

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