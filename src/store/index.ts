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
            accessToken: "",
            refreshToken: ""
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
        setAuthenticationTokens(state, authenticationToken) {
            state.authentication.accessToken = authenticationToken.accessToken;
            state.authentication.refreshToken = authenticationToken.refreshToken;

            localStorage.setItem("accessToken", authenticationToken.accessToken);
            localStorage.setItem("refreshToken", authenticationToken.refreshToken);
        },
        clearAuthenticationTokens(state) {
            state.authentication.accessToken = "";
            state.authentication.refreshToken = "";

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    },
    actions: {
        initialize({ commit }) {
            // Set any authentication tokens
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (accessToken && refreshToken) {
                const authenticationTokens = {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }

                commit("setAuthenticationTokens", authenticationTokens);
            }
        },
        clearRegistrationState({ commit }) {
            commit("clearRegistration")
        },
        login({ commit }, authenticationToken) {
            commit("clearAuthenticationTokens");
            commit("setAuthenticationTokens", authenticationToken);
        },
        logout({ commit }) {
            commit("clearAuthenticationTokens");
        }
    },
    getters: {
        isUserLoggedIn: (state, getters) => {
            return !!state.authentication.refreshToken && getters.getRefreshTokenExpirationDate > new Date()
        },
        getRefreshTokenExpirationDate: state => {
            if (!state.authentication.refreshToken) {
                return null;
            }

            const token: any = jwt_decode(state.authentication.refreshToken);
            if (!token.exp) {
                return null;
            }

            const date = new Date(0)
            date.setUTCSeconds(token.exp);
            return date;
        },
        getRefreshToken: state => state.authentication.refreshToken,
        getAccessToken: state => state.authentication.accessToken,
        getRegistration: state => state.registration // Return the entire registration state
    }
})