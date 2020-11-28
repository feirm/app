/* eslint-disable @typescript-eslint/camelcase */
import { createStore } from 'vuex';
import jwt_decode from "jwt-decode";

export const store = createStore({
    state: {
        registration: {
            username: "",
            email: "",
            password: "",
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
        // Reset registration state
        clearRegistration(state) {
            state.registration.username = "";
            state.registration.email = "";
            state.registration.password = "";
        },
        setAuthenticationTokens(state, authenticationToken) {
            state.authentication.accessToken = authenticationToken.accessToken;
            state.authentication.refreshToken = authenticationToken.refreshToken;

            localStorage.setItem("accessToken", authenticationToken.accessToken);
            localStorage.setItem("refreshToken", authenticationToken.refreshToken);
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
            commit("setAuthenticationTokens", authenticationToken);
        }
    },
    getters: {
        isUserLoggedIn: (state, getters) => {
            return !!state.authentication.accessToken && getters.getAccessTokenExpirationDate > new Date()
        },
        getAccessTokenExpirationDate: state => {
            if (!state.authentication.accessToken) {
                return null;
            }

            const token: any = jwt_decode(state.authentication.accessToken);
            if (!token.exp) {
                return null;
            }

            const date = new Date(0)
            date.setUTCSeconds(token.exp);
            return date;
        },
        getAccessToken: state => state.authentication.accessToken,
        getRegistration: state => state.registration // Return the entire registration state
    }
})