<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  mounted() {
    // Toggle between darkmode
    const darkMode = localStorage.getItem("darkMode")!;
    const isDark = (darkMode === 'true');
    
    document.body.classList.toggle('dark', isDark);
  }
});
</script>