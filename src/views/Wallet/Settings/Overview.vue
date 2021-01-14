<template>
    <ion-page>
        <ion-content class="ion-padding" :fullscreen="true">
            Settings page
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
    IonPage,
    IonContent
} from "@ionic/vue";

export default defineComponent({
    name: "SettingsOverview",
    components: {
        IonPage,
        IonContent
    }
})
</script>