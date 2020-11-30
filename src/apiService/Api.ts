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
    const accessToken = store.getters.getAccessToken;

    if (accessToken) {
      config.headers.Authorization = "Bearer " + accessToken;
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

    // Do not get stuck in infinite loop
    if (
      error.response.status === 401 &&
      originalRequest.path === "/api/v1/user/token/refresh"
    ) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      return axios
        .post(`${process.env.VUE_APP_TATSUYA_API_URL}v1/user/token/refresh`, {
          accessToken: store.getters.getAccessToken,
          refreshToken: store.getters.getRefreshToken,
        })
        .then((res) => {
          // Update authentication tokens
          store.dispatch("login", res.data)

          // Attempt to handle the original request
          originalRequest.headers.Authorization = "Bearer " + res.data.accessToken;

          return axios(originalRequest);
        });
    }

    return Promise.reject(error);
  }
);

// Export all Axios instances
export { tatsuyaApi };
