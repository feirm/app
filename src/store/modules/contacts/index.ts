import { Contact } from '@/lib/contacts';

export const contacts = {
  state: {
    contacts: [] as Contact[]
  },
  mutations: {
    setContacts(state, contacts) {
      state.contacts = contacts;
    }
  },
  getters: {
      getAllContacts: state => state.contacts
  }
};