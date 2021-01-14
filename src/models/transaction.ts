// Typical wallet transaction model
export interface Transaction {
    txid: string;
    value: string;
    blockTime: string;
    confirmations: number;
    ticker: string;
    isMine: boolean;
}

// UTXO transaction model
export interface Utxo {
    txid: string;
    hex: string;
    value: string;
}