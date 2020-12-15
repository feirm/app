import { Contact } from '@/lib/contacts';

export const contacts = {
  state: {
    contacts: [] as Contact[]
  },
  mutations: {
    setContacts(state, contacts) {
      state.contacts = contacts;
    },
    addContact(state, contact) {
        state.contacts.push(contact);
    },
    deleteContact(state, id) {
        const index = state.contacts.map(contact => contact.id).indexOf(id);
        state.contacts.splice(index, 1);
    }
  },
  getters: {
      getAllContacts: state => state.contacts,
      getContact: (state) => (id) => {
          return state.contacts.find(contact => contact.id === id);
      }
  }
};