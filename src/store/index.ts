/* eslint-disable @typescript-eslint/camelcase */
import { createStore } from 'vuex';
import jwt_decode from "jwt-decode";

export const store = createStore({
    state: {
        registration: {
            username: "",
            email: "",
            password: "",
            pin: 0
        },
        authentication: {
            rootKey: "",
            sessionToken: "",
            username: ""
        }
    },
    mutations: {
        // Mutations for registration process
        registerUsername(state, username) {
            state.registration.username = username;
        },
        registerEmail(state, email) {
            state.registration.email = email;
        },
        registerPassword(state, password) {
            state.registration.password = password;
        },
        registerPin(state, pin) {
            state.registration.pin = pin;
        },
        // Reset registration state
        clearRegistration(state) {
            state.registration.username = "";
            state.registration.email = "";
            state.registration.password = "";
            state.registration.pin = 0;
        },
        setSessionState(state, sessionData) {
            state.authentication.rootKey = sessionData.rootKey;
            state.authentication.sessionToken = sessionData.sessionToken;
            state.authentication.username = sessionData.username;

            localStorage.setItem("session", JSON.stringify(sessionData));
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
            commit("clearRegistration")
        },
        login({ commit }, sessionData) {
            commit("setSessionState", sessionData);
        },
        logout({ commit }) {
            commit("clearAuthenticationTokens");
        }
    },
    getters: {
        isUserLoggedIn: (state, getters) => {
            return !!state.authentication.sessionToken && getters.getSessionExpirationDate > new Date()
        },
        getSessionExpirationDate: (state, getters) => {
            if (!getters.getSessionToken) {
                return null;
            }

            const token: any = jwt_decode(getters.getSessionToken);
            if (!token.exp) {
                return null;
            }

            const date = new Date(0)
            date.setUTCSeconds(token.exp);
            return date;
        },
        getSessionToken: state => state.authentication.sessionToken,
        getUsername: state => state.authentication.username,
        getRegistration: state => state.registration // Return the entire registration state
    }
})