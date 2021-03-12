import { EncryptedAccountV2 } from "@/models/account"
import { keyStorageApi } from "./Api"

export default {
    // Submit a key to the new authentication API
    SendKey(account: EncryptedAccountV2) {
        return keyStorageApi.post("/v1/add_key", account)
    }
}