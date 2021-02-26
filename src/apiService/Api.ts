import { store } from "@/store";
import axios from "axios";
import tatsuyaService from "./tatsuyaService";

import Account from "@/class/account";
import { AuthenticationToken } from "@/models/account";

// Axios instance for Tatsuya authentication API
const tatsuyaApi = axios.create({
  baseURL: process.env.VUE_APP_TATSUYA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors for new session token
tatsuyaApi.interceptors.request.use(
  (config) => {
    const sessionToken = store.getters.getSessionToken;

    if (sessionToken) {
      config.headers.Authorization = "Bearer " + sessionToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

tatsuyaApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Fetch the username and account root key
      const username = localStorage.getItem("username")!;
      const rootKey = Account.getRootKey();

      // Reconstruct the identity keypair
      const keypair = await Account.deriveIdentityKeypair(rootKey)

      // Fetch and sign the authentication token for the username
      const loginToken = await (await tatsuyaService.getLoginToken(username)).data as AuthenticationToken;
      const signedToken = await Account.signAuthenticationToken(keypair, loginToken);
      signedToken.username = username;

      // Submit signed token to API to get a session
      const session = await tatsuyaService.loginAccount(signedToken);

      // Update Vuex to store JWT
      store.dispatch("login", session.data)

      // Attempt to handle the original request
      originalRequest.headers.Authorization = "Bearer " + session.data.sessionToken;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Blockbook API
const blockBookApi = axios.create({
  baseURL: "https://blockbook.feirm.com/api",
});

// Azure API
const azureApi = axios.create({
  baseURL: process.env.VUE_APP_AZURE_API_URL,
});

// Export all Axios instances
export { tatsuyaApi, blockBookApi, azureApi };
