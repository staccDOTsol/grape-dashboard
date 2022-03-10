import { TransactionFees } from "@mean-dao/msp";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ENV } from "@solana/spl-token-registry";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { INPUT_AMOUNT_PATTERN } from "../constants";
import { AccountTokenParsedInfo, TokenAccountInfo } from "../models/token";
import { percentage } from "./ui";

export const getChainIdByClusterName = (network: WalletAdapterNetwork): number => {
    switch (network) {
        case WalletAdapterNetwork.Devnet:
            return ENV.Devnet;
        case WalletAdapterNetwork.Testnet:
            return ENV.Testnet;
        default:
            return ENV.MainnetBeta;
    }
}

export const getSolanaExplorerClusterParamByClusterName = (network: WalletAdapterNetwork): string => {
    switch (network) {
        case WalletAdapterNetwork.Devnet:
            return '?cluster=devnet';
        case WalletAdapterNetwork.Testnet:
            return '?cluster=testnet';
        default:
            return '';
    }
}

export const getTxPercentFeeAmount = (fees: TransactionFees, amount?: any): number => {
    let fee = 0;
    let inputAmount = amount ? parseFloat(amount) : 0;
    if (fees && fees.mspPercentFee) {
        fee = percentage(fees.mspPercentFee, inputAmount);
    }
    return fee;
}

export const getTxFeeAmount = (fees: TransactionFees, amount?: any): number => {
    let fee = 0;
    let inputAmount = amount ? parseFloat(amount) : 0;
    if (fees) {
        if (fees.mspPercentFee) {
            fee = percentage(fees.mspPercentFee, inputAmount);
        } else if (fees.mspFlatFee) {
            fee = fees.mspFlatFee ? fees.blockchainFee + fees.mspFlatFee : fees.blockchainFee;
        }
    }
    return fee;
};

export async function findATokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): Promise<PublicKey> {

    return (
        await PublicKey.findProgramAddress(
            [
                walletAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        )
    )[0];
}

export async function fetchAccountTokens(
    connection: Connection,
    pubkey: PublicKey
) {
    let data;
    try {
        const { value } = await connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID });
        data = value.map((accountInfo: any) => {
            const parsedInfo = accountInfo.account.data.parsed.info as TokenAccountInfo;
            return { parsedInfo, pubkey: accountInfo.pubkey };
        });
        return data as AccountTokenParsedInfo[];
    } catch (error) {
        console.error(error);
    }
}

export function isValidNumber(str: string): boolean {
    if (str === null || str === undefined) { return false; }
    return INPUT_AMOUNT_PATTERN.test(str);
}

export function chunks<T>(array: T[], size: number): T[][] {
    return Array.apply<number, T[], T[][]>(
        0,
        new Array(Math.ceil(array.length / size))
    ).map((_, index) => array.slice(index * size, (index + 1) * size));
}

export function getTxIxResume(tx: Transaction) {
    const programIds: string[] = [];
    tx.instructions.forEach(t => {
        const programId = t.programId.toBase58();
        if (!programIds.includes(programId)) {
            programIds.push(programId);
        }
    });
    return {numIxs: tx.instructions.length, programIds: programIds};
}
