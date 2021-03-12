import { EncryptedKey } from "@/models/account"
import { keyStorageApi } from "./Api"

export default {
    // Submit a key to the new authentication API
    SendKey(key: EncryptedKey) {
        return keyStorageApi.post("/v1/add_key", key)
    }
}