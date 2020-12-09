import { blockBookApi } from "@/apiService/Api";

export default {
    // Return data for xpub
    getXpub(xpub: string) {
        return blockBookApi.get(`/xpub/${xpub}`);
    }
}