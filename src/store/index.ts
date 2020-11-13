import { createStore } from 'vuex';

export const store = createStore({
    state: {
        accessToken: ""
    },
    mutations: {
        setAccessToken(state, accessToken) {
            state.accessToken = accessToken;
            localStorage.setItem("accessToken", accessToken);
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
        getToken: state => state.accessToken
    }
})