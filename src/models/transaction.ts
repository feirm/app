export interface Transaction {
    txid: string;
    value: string;
    blockTime: string;
    confirmations: number;
    ticker: string;
    isMine: boolean;
}