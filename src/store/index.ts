/* eslint-disable @typescript-eslint/camelcase */
import { createStore } from 'vuex';
import jwt_decode from "jwt-decode";
import { Wallet } from "@/lib/wallet";

export const store = createStore({
    state: {
        registration: {
            username: "",
            email: "",
            password: "",
            pin: 0,
            confirmPin: 0
        },
        login: {
            username: "",
            password: "",
            pin: 0
        },
        authentication: {
            rootKey: "",
            sessionToken: "",
            username: ""
        },
        wallet: {} as Wallet
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
        confirmPin(state, pin) {
            state.registration.confirmPin = pin;
        },
        registerRootKey(state, key) {
            state.authentication.rootKey = key;
        },
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
        // Mutations for wallet
        setMnemonic(state, mnemonic) {
            state.wallet.mnemonic = mnemonic;
        },
        setWalletState(state, wallet) {
            state.wallet = wallet;
        }
    },
    actions: {
        initialize({ commit }) {
            // Load existing session if its in storage
            const session = localStorage.getItem("session");
            const wallet = localStorage.getItem("wallet");

            if (session) {
                commit("setSessionState", JSON.parse(session));
            }

            if (wallet) {
                commit("setWalletState", JSON.parse(wallet));
            }
        },
        clearRegistrationState({ commit }) {
            commit("clearRegistration")
        },
        login({ commit }, sessionData) {
            commit("setSessionState", sessionData);
        },
        logout({ commit }) {
            commit("clearSessionState");
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
        getRootKey: state => state.authentication.rootKey,
        getRegistration: state => state.registration, // Return the entire registration state
        getLoginState: state => state.login, // Return the entire login state

        // Wallet
        getWalletMnemonic: state => state.wallet.mnemonic,
        getWallet: state => state.wallet
    }
})