import { ConfirmedTransaction } from "@solana/web3.js";
import { TransactionStatus } from "./enums";

export type Confirmations = number | "max";
export type Timestamp = number | "unavailable";

export enum FetchStatus {
    Iddle,
    Fetching,
    FetchFailed,
    Fetched,
}

export class TransactionWithSignature {
    constructor(
        public signature: string,
        public confirmedTransaction: ConfirmedTransaction,
        public timestamp: Timestamp
    ) { }
}

export interface TransactionStatusInfo {
    customError?: any;
    lastOperation?: TransactionStatus | undefined;
    currentOperation?: TransactionStatus | undefined;
}
