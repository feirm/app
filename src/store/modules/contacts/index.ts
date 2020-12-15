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
    }
  },
  getters: {
      getAllContacts: state => state.contacts
  }
};