import { createStore } from 'vuex';

export const store = createStore({
    state: {
        registration: {
            username: "",
            email: "",
            password: "",
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
        }
    },
    actions: {
        initialize({ commit }) {
            commit("registerUsername", "");
            commit("registerEmail", "");
            commit("registerPassword", "");
        },
        clearRegistrationState({ commit }) {
            commit("clearRegistration")
        }
    },
    getters: {
        isUserLoggedIn: () => false, // Set to false for testing purposes.
        getRegistration: state => state.registration // Return the entire registration state
    }
})