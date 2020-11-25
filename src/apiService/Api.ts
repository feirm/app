import axios from "axios";

// Axios instance for Tatsuya authentication API
const tatsuyaApi = axios.create({
    baseURL: process.env.VUE_APP_TATSUYA_API_URL
})

// Export all Axios instances
export {
    tatsuyaApi
}