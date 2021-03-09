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
    setSessionState(state, sessionToken) {
      state.authentication.sessionToken = sessionToken
      sessionStorage.setItem("session", sessionToken);
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
