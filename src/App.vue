<template>
  <ion-app>
    <ion-router-outlet />
    <button @click="refreshApp" v-if="updateExists">New version available. Click to update!</button>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'App',
  components: {
    IonApp,
    IonRouterOutlet
  },
  data() {
    return {
      refreshing: false,
      registration: null as any,
      updateExists: false
    }
  },
  created() {
    document.addEventListener('swUpdated', this.showRefreshUI, { once: true })

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener(
        'controllerchange', () => {
          if (this.refreshing) {
            return;
          }

          window.location.reload();
        }
      )
    }
  },
  methods: {
    showRefreshUI(e) {
      this.registration = e.detail;
      this.updateExists = true;
    },
    refreshApp() {
      this.updateExists = false;

      if (!this.registration || !this.registration.waiting) {
        return;
      }

      this.registration.waiting.postMessage('skipWaiting');
    }
  }
});
</script>