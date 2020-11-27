import { tatsuyaApi } from "@/apiService/Api";

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
    }
}