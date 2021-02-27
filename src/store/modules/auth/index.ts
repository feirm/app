import Account from "@/class/account";
import jwt_decode from "jwt-decode";

export const auth = {
  state: {
    authentication: {
      sessionToken: "",
      username: "",
    },
  },
  mutations: {
    setSessionState(state, sessionData) {
      state.authentication.sessionToken = sessionData.sessionToken;
      state.authentication.username = sessionData.username;

      // Store session token in SessionStorage
      sessionStorage.setItem("session", sessionData.sessionToken);

      // Update username in LocalStorage
      localStorage.setItem("username", sessionData.username);
    },
  },
  actions: {
    initialize({ commit }) {
      // Load in username and session token
      const username = localStorage.getItem("username");
      const sessionToken = sessionStorage.getItem("session");

      const sessionData = {
        username,
        sessionToken
      }

      commit("setSessionState", sessionData);
    },
    login({ commit }, sessionData) {
      commit("setSessionState", sessionData);
    },
  },
  getters: {
    isUserLoggedIn: () => {
      // The user is considered logged in if the root key is present
      const rootKey = Account.getRootKey();

      if(rootKey !== undefined) {
        return true
      }

      return false;
    },
    getSessionExpirationDate: (getters) => {
      if (!getters.getSessionToken) {
        return null;
      }

      const token: any = jwt_decode(getters.getSessionToken);
      if (!token.exp) {
        return null;
      }

      const date = new Date(0);
      date.setUTCSeconds(token.exp);
      return date;
    },
    getSessionToken: (state) => state.authentication.sessionToken,
    getUsername: (state) => state.authentication.username
  },
};
