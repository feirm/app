import { keyStorageApi } from "./Api"

export default {
    // Submit a key to the new authentication API
    SendKey(keyPayload) {
        return keyStorageApi.post("/v1/add_key", keyPayload)
    }
}