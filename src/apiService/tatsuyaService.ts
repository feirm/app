import { tatsuyaApi } from "@/apiService/Api";

// Export all endpoints for authentication API
export default {
    // Check if username exists
    checkUsername(username: string) {
        return tatsuyaApi.get(`/v1/checkUsername?username=${username}`)
    }
}