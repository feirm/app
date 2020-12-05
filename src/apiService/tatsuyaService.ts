import { tatsuyaApi } from "@/apiService/Api";
import { Account } from "@/lib/account";
import { EncryptedContact } from '@/lib/contacts';

// Export all endpoints for authentication API
export default {
    // Check if username exists
    checkUsername(username: string) {
        return tatsuyaApi.get(`/v1/checkUsername?username=${username}`)
    },
    // Check if email is valid and not in use
    checkEmail(email: string) {
        return tatsuyaApi.get(`/v1/checkEmail?email=${email}`)
    },
    // Fetch a temporary registration token
    getRegistrationToken() {
        return tatsuyaApi.get(`/v1/register/token`)
    },
    // Register a user account
    registerAccount(account: Account) {
        return tatsuyaApi.post(`/v1/register`, account)
    },
    // Fetch a temporary login token
    getLoginToken(user: any) {
        return tatsuyaApi.post(`/v1/login/token`, {
            username: user
        })
    },
    // Fetch an encrypted account blob
    fetchEncryptedAccount(user: string, pin: number) {
        return tatsuyaApi.post(`/v1/login/fetchAccount`, {
            username: user,
            pin: pin
        })
    },
    // Login to an account
    loginAccount(token: any) {
        return tatsuyaApi.post(`/v1/login`, token)
    },
    // Add new contact
    newContact(contact: EncryptedContact) {
        return tatsuyaApi.post(`/v1/contacts/new`, contact);
    },
    // Fetch all contacts
    fetchContacts() {
        return tatsuyaApi.get(`v1/contacts/all`);
    }
}