import { Coin } from "./coin";

/*
This interface represents what a Wallet should look like
*/
export interface Wallet {
    id: string;
    secret: string;
    coins: Coin[];
}