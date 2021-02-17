export const options = {
  state: {
    darkMode: null
  },
  mutations: {
    toggleDarkMode(state, toggled) {
      state.darkMode = toggled;
      document.body.classList.toggle('dark', toggled);

      localStorage.setItem("darkMode", toggled);
    },
  },
  actions: {
    initialize({ commit }) {
        // Fetch existing dark mode option if there is one
        const darkMode = localStorage.getItem("darkMode") as any;
        commit("toggleDarkMode", darkMode);
    }
  },
  getters: {
      darkModeEnabled: state => state.darkMode
  }
};