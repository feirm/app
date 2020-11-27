import { tatsuyaApi } from "@/apiService/Api";
import { Account } from "@/lib/account";

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
    }
}