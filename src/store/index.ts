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
            state.authentication.sessionToken = sessionData.sessionToken;
            state.authentication.username = sessionData.username;

            localStorage.setItem("feirmAccount", sessionData);
        },
    },
    actions: {
        initialize({ commit }) {
            // Load existing session if its in storage
            const session = localStorage.getItem("feirmAccount");

            if (session) {
                commit("setSessionState", session);
            }
        },
        clearRegistrationState({ commit }) {
            commit("clearRegistration")
        },
        login({ commit }, authenticationToken) {
            commit("setAuthenticationTokens", authenticationToken);
        },
        logout({ commit }) {
            commit("clearAuthenticationTokens");
        }
    },
    getters: {
        isUserLoggedIn: (state, getters) => {
            return !!state.authentication.sessionToken && getters.getRefreshTokenExpirationDate > new Date()
        },
        getSessionExpirationDate: state => {
            if (!state.authentication.sessionToken) {
                return null;
            }

            const token: any = jwt_decode(state.authentication.sessionToken);
            if (!token.exp) {
                return null;
            }

            const date = new Date(0)
            date.setUTCSeconds(token.exp);
            return date;
        },
        getSessionToken: state => state.authentication.sessionToken,
        getUsername: state => state.authentication.sessionToken,
        getRegistration: state => state.registration // Return the entire registration state
    }
})