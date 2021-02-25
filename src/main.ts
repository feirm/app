import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { store } from "@/store";

// Sentry
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

import { IonicVue } from "@ionic/vue";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css";
import "@ionic/vue/css/float-elements.css";
import "@ionic/vue/css/text-alignment.css";
import "@ionic/vue/css/text-transformation.css";
import "@ionic/vue/css/flex-utils.css";
import "@ionic/vue/css/display.css";

/* Theme variables */
import "./theme/variables.css";

// Initialise the store
store.dispatch("initialize");

// Service worker
import "@/registerServiceWorker";

const app = createApp(App)
  .use(IonicVue)
  .use(store)
  .use(router);

// Sentry (only in production)
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      "https://995a8522ee9745f4a0fc8035d001c9f2@o533251.ingest.sentry.io/5652656",
    integrations: [new Integrations.BrowserTracing()],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}

router.isReady().then(() => {
  app.mount("#app");
});
