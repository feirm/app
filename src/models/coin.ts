/*
This interface represents what we want our coin object to look like
*/
export interface Coin {
    name: string;
    ticker: string;
    balance: number; // Balance of the coin in Satoshis
    unconfirmedBalance: number; // Unconfirmed balance of the coin in Satoshis
    rootKey: string; // BIP32 root/master key
    extendedPublicKey: string; // BIP32/44/49 extended public key
    extendedPrivateKey: string; // BIP32/44/49 extended private key
}