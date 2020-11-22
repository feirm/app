import axios from "axios";

// Axios instance for Tatsuya authentication API
const tatsuyaApi = axios.create({
    baseURL: 'http://127.0.0.1:3000/api/'
})

// Export all Axios instances
export {
    tatsuyaApi
}