import { createStore } from 'vuex';

export const store = createStore({
    state: {
        accessToken: "",
        walletWarning: false // Wallet warning is false by default
    },
    mutations: {
        setAccessToken(state, accessToken) {
            state.accessToken = accessToken;
            localStorage.setItem("accessToken", accessToken);
        },
        confirmWalletWarning(state, accepted) {
            state.walletWarning = accepted;
            localStorage.setItem("walletWarning", accepted);
        }
    },
    actions: {
        initialize({ commit }) {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken) {
                commit("setAccessToken", accessToken);
            }
        }
    },
    getters: {
        getToken: state => state.accessToken,
        isWalletWarningConfirmed: state => state.walletWarning, // Check if the wallet warning has been confirmed
        isUserLoggedIn: () => false // Set to false for testing purposes.
    }
})