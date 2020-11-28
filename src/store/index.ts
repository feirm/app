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
        }
    },
    actions: {
        initialize({ commit }) {
            commit("registerUsername", "");
            commit("registerEmail", "");
            commit("registerPassword", "");
        }
    },
    getters: {
        isUserLoggedIn: () => false, // Set to false for testing purposes.
        getRegistration: state => state.registration // Return the entire registration state
    }
})