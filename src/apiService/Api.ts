import { store } from "@/store";
import axios from "axios";

// Axios instance for Tatsuya authentication API
const tatsuyaApi = axios.create({
  baseURL: process.env.VUE_APP_TATSUYA_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptors for refresh tokens
tatsuyaApi.interceptors.request.use(
  (config) => {
    if (store.getters.getAccessToken) {
      config.headers.authorization = `Bearer ${store.getters.getAccessToken}`;
      return config;
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

    if (error.response.status === 401) {
      const accessToken = store.getters.getAccessToken;
      const refreshToken = store.getters.getRefreshToken;

      return axios
        .post(`${process.env.VUE_APP_TATSUYA_API_URL}v1/user/token/refresh`, {
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
        .then(({ data} ) => {
          // Save the new set of tokens
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          console.log("Set new rtokens")

          // Attempt to handle the original request
          axios.defaults.headers.common[
            "Authorization"
          ] = 'Bearer ' + data.accessToken;

          originalRequest.headers[
            "Authorization"
          ] = 'Bearer ' + data.accessToken;

          return axios(originalRequest);
        });
    }

    return Promise.reject(error);
  }
);

// Export all Axios instances
export { tatsuyaApi };
