export const options = {
  state: {
    darkMode: true
  },
  mutations: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkM;
    },
  },
  getters: {
      darkModeEnabled: state => state.darkMode
  }
};