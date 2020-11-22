import axios from "axios";

// Axios instance for Tatsuya authentication API
const tatsuyaApi = axios.create({
    baseURL: 'https://tatsuya.feirm.com/api/'
})

// Export all Axios instances
export {
    tatsuyaApi
}