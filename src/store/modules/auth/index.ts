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
    login({ commit }, sessionData) {
      commit("setSessionState", sessionData);
    },
    logout({ commit }) {
      commit("clearSessionState");
    },
  },
  getters: {
    isUserLoggedIn: (state, getters) => {
      return (
        !!state.authentication.sessionToken &&
        getters.getSessionExpirationDate > new Date()
      );
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
