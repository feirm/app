import jwt_decode from "jwt-decode";

export const auth = {
  state: {
    login: {
      username: "",
      password: "",
      pin: "",
    },
    authentication: {
      rootKey: "",
      sessionToken: "",
      username: "",
    },
  },
  mutations: {
    // Mutations for login process
    loginUsername(state, username) {
      state.login.username = username;
    },
    loginPassword(state, password) {
      state.login.password = password;
    },
    loginPin(state, pin) {
      state.login.pin = pin;
    },
    setSessionState(state, sessionData) {
      state.authentication.rootKey = sessionData.rootKey;
      state.authentication.sessionToken = sessionData.sessionToken;
      state.authentication.username = sessionData.username;

      localStorage.setItem("session", JSON.stringify(sessionData));
    },
    clearSessionState(state) {
      state.authentication.rootKey = "";
      state.authentication.sessionToken = "";
      state.authentication.username = "";

      localStorage.removeItem("session");
    },
  },
  actions: {
    initialize({ commit }) {
      // Load existing session if its in storage
      const session = localStorage.getItem("session");

      if (session) {
        commit("setSessionState", JSON.parse(session));
      }
    },
    clearRegistrationState({ commit }) {
      commit("clearRegistration");
    },
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
    getSessionExpirationDate: (state, getters) => {
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
    getUsername: (state) => state.authentication.username,
    getRootKey: (state) => state.authentication.rootKey,
    getLoginState: (state) => state.login, // Return the entire login state
  },
};
