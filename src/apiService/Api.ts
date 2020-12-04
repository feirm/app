import { store } from "@/store";
import axios from "axios";
import tatsuyaService from "./tatsuyaService";
import * as nacl from "tweetnacl";
import bufferToHex from "@/lib/bufferToHex";

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
    const sessionToken = store.getters.sessionToken;

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
  (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Fetch a new authentication/session token for the user
      const username = store.getters.getUsername;
      const rootKey = store.getters.getRootKey;

      // Reconstruct the identity key from the root key
      const identityKeyString = rootKey + "identity";
      window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(identityKeyString))
        .then(async (identityKey) => {
          // Derive the signing ed25519 keypair from identityKey
          const rootKeyPair = nacl.sign.keyPair.fromSeed(
            new Uint8Array(identityKey)
          );

          await tatsuyaService.getLoginToken(username).then(async (res) => {
            // Create signature
            const signature = nacl.sign.detached(
              new TextEncoder().encode(res.data.nonce),
              rootKeyPair.secretKey
            );

            // Construct the login/new session payload
            const payload = {
              id: res.data.id,
              username: username,
              signature: bufferToHex(signature),
            };

            await tatsuyaService.loginAccount(payload).then((res) => {
              // Construct the session object
              const session = {
                rootKey: rootKey,
                sessionToken: res.data.sessionToken,
                username: res.data.username,
              };

              store.dispatch("login", session);

              // Attempt to handle the original request
              originalRequest.headers.Authorization =
                "Bearer " + res.data.sessionToken;
              return axios(originalRequest);
            });
          });
        });
    }

    return Promise.reject(error);
  }
);

// Export all Axios instances
export { tatsuyaApi };
